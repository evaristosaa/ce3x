"""Open a trusted local CEX in CE3X and collect its newly exported XML."""
import argparse
import ctypes
import datetime
import json
from ctypes import wintypes
import re
import shutil
import subprocess
import tempfile
import time
import xml.etree.ElementTree as ET
from pathlib import Path

DEFAULT_CE3X = Path(r"C:\Program Files (x86)\CE3Xv3.2\ce3xv3.2.exe")
MAX_XML_BYTES = 12 * 1024 * 1024
JOB_DIRECTORY = re.compile(r"CE3X-[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}")


def collect_xml(source, destination, executable, timeout):
    if source.suffix.lower() != ".cex" or not source.is_file():
        raise ValueError("Selecciona un archivo CEX local de confianza.")
    if destination.suffix.lower() != ".xml" or destination.exists():
        raise ValueError("Indica un destino XML nuevo.")
    if not executable.is_file():
        raise ValueError("No se encontró CE³X 3.2.")
    with tempfile.TemporaryDirectory(prefix="ce3x-xml-") as folder:
        project = Path(folder) / source.name
        shutil.copyfile(source, project)
        result = project.with_suffix(".xml")
        subprocess.Popen([str(executable), str(project)], cwd=executable.parent)
        print("En CE³X, califica el proyecto y pulsa Generar XML. Revisa las fechas y las mejoras.", flush=True)
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            if result.is_file():
                try:
                    with result.open("rb") as stream:
                        data = stream.read(MAX_XML_BYTES + 1)
                    if len(data) > MAX_XML_BYTES or b"\x00" in data or b"<!DOCTYPE" in data.upper():
                        raise ValueError("El XML exportado no cumple los límites del conversor.")
                    root = ET.fromstring(data)
                except (OSError, ET.ParseError):
                    time.sleep(0.5)
                    continue
                if root.tag.rsplit("}", 1)[-1] != "DatosEnergeticosDelEdificio":
                    raise ValueError("CE³X no devolvió un XML de certificado energético.")
                with destination.open("xb") as stream:
                    stream.write(data)
                return
            time.sleep(0.5)
        raise TimeoutError("CE³X no exportó el XML en el tiempo indicado.")


def request_xml_options(process, project):
    """Calculate this CE3X 3.2 project and open its XML options."""
    user = ctypes.WinDLL("user32", use_last_error=True)
    callback = ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
    user.GetWindowThreadProcessId.argtypes = (wintypes.HWND, ctypes.POINTER(wintypes.DWORD))
    user.GetWindowTextW.argtypes = (wintypes.HWND, wintypes.LPWSTR, ctypes.c_int)
    user.EnumWindows.argtypes = (callback, wintypes.LPARAM)
    user.EnumChildWindows.argtypes = (wintypes.HWND, callback, wintypes.LPARAM)
    user.GetDlgCtrlID.argtypes = (wintypes.HWND,)
    user.SendMessageTimeoutW.argtypes = (wintypes.HWND, wintypes.UINT, wintypes.WPARAM, wintypes.LPARAM, wintypes.UINT, wintypes.UINT, ctypes.POINTER(ctypes.c_size_t))
    user.SendMessageTimeoutW.restype = wintypes.LPARAM
    user.IsWindowEnabled.argtypes = (wintypes.HWND,)
    user.PostMessageW.argtypes = (wintypes.HWND, wintypes.UINT, wintypes.WPARAM, wintypes.LPARAM)
    expected = str(project).casefold()
    matches = []

    @callback
    def find_project(hwnd, _):
        pid = wintypes.DWORD()
        user.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
        if pid.value == process.pid:
            title = ctypes.create_unicode_buffer(4096)
            user.GetWindowTextW(hwnd, title, len(title))
            if title.value.casefold().endswith(": " + expected):
                matches.append(hwnd)
        return True

    deadline = time.monotonic() + 30
    while process.poll() is None and time.monotonic() < deadline:
        matches.clear()
        user.EnumWindows(find_project, 0)
        if len(matches) == 1:
            window = matches[0]
            result = ctypes.c_size_t()
            calculated = user.SendMessageTimeoutW(window, 0x0111, 3195, 0, 2, 120000, ctypes.byref(result))
            if calculated and user.IsWindowEnabled(window):
                if not user.PostMessageW(window, 0x0111, 3200, 0):
                    return False
                try:
                    fill_report_options(user, callback, process, project)
                except (OSError, ValueError) as error:
                    print(f"No se pudieron rellenar las opciones XML: {error}", flush=True)
                return True
            return False
        time.sleep(0.5)
    return False


def fill_report_options(user, callback, process, project):
    sidecar = project.with_name("report.json")
    if not sidecar.is_file():
        return
    report = json.loads(sidecar.read_text(encoding="utf-8"))
    values = {}
    for field, first_id in (("issueDate", 134), ("visitDate", 140)):
        if report.get(field):
            date = datetime.date.fromisoformat(report[field])
            values.update({first_id: f"{date.day:02}", first_id + 1: f"{date.month:02}",
                           first_id + 2: str(date.year)})
    for field, control in (("observations", 117), ("recommendations", (117, 1)), ("documentation", 120)):
        if report.get(field):
            values[control] = report[field]
    if not values:
        return

    dialogs = []
    controls = {}
    auto_submit = report.get("autoSubmit") is True and {140, 141, 142, 117} <= values.keys()
    expected_controls = values.keys() | ({121} if auto_submit else set())

    @callback
    def find_dialog(hwnd, _):
        pid = wintypes.DWORD()
        user.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
        title = ctypes.create_unicode_buffer(128)
        if pid.value == process.pid:
            user.GetWindowTextW(hwnd, title, len(title))
            if title.value == "Opciones del Informe":
                dialogs.append(hwnd)
        return True

    @callback
    def find_control(hwnd, _):
        key = user.GetDlgCtrlID(hwnd)
        if key == 117:
            # CE³X uses ID 117 twice, in inspection/recommendation order.
            key = 117 if 117 not in controls else (117, 1)
        if key in expected_controls or (key == 117 and (117, 1) in expected_controls):
            controls.setdefault(key, hwnd)
        return True

    deadline = time.monotonic() + 10
    while process.poll() is None and time.monotonic() < deadline:
        dialogs.clear()
        user.EnumWindows(find_dialog, 0)
        if len(dialogs) == 1:
            controls.clear()
            user.EnumChildWindows(dialogs[0], find_control, 0)
            if expected_controls <= controls.keys():
                for key, value in values.items():
                    text = ctypes.create_unicode_buffer(value)
                    result = ctypes.c_size_t()
                    sent = user.SendMessageTimeoutW(controls[key], 0x000C, 0,
                        ctypes.addressof(text), 2, 1000, ctypes.byref(result))
                    if not sent or not result.value:
                        raise ValueError("CE³X no confirmó el cambio de un campo.")
                print("Datos del informe enviados al diálogo XML.", flush=True)
                if auto_submit and not user.PostMessageW(controls[121], 0x00F5, 0, 0):
                    raise ValueError("No se pudo solicitar Generar XML.")
                if auto_submit and report.get("acceptNoImprovements") is True:
                    accept_missing_improvements(user, callback, process, project)
                return
        time.sleep(0.2)
    raise ValueError("No se encontraron los campos del diálogo XML.")


def accept_missing_improvements(user, callback, process, project):
    notice = ("No ha seleccionado ningún conjunto de mejoras para su edificio. "
              "Si no rellena quiere decir que considera que no hay mejora.")
    matches = []
    buttons = []

    @callback
    def inspect_child(hwnd, _):
        text = ctypes.create_unicode_buffer(512)
        result = ctypes.c_size_t()
        user.SendMessageTimeoutW(hwnd, 0x000D, len(text), ctypes.addressof(text), 2, 250,
                                 ctypes.byref(result))
        normalized = " ".join(text.value.split())
        if normalized == notice:
            matches.append(hwnd)
        if normalized in ("OK", "Aceptar"):
            buttons.append(hwnd)
        return True

    @callback
    def inspect_window(hwnd, _):
        pid = wintypes.DWORD()
        user.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
        if pid.value != process.pid:
            return True
        title = ctypes.create_unicode_buffer(128)
        user.GetWindowTextW(hwnd, title, len(title))
        if title.value != "Aviso":
            return True
        matches.clear()
        buttons.clear()
        user.EnumChildWindows(hwnd, inspect_child, 0)
        if len(matches) == 1 and len(buttons) == 1 and user.PostMessageW(buttons[0], 0x00F5, 0, 0):
            print("Aviso de conjuntos de mejora aceptado según la confirmación de la app.", flush=True)
            return False
        return True

    deadline = time.monotonic() + 120
    while process.poll() is None and time.monotonic() < deadline:
        if project.with_suffix(".xml").exists() or not user.EnumWindows(inspect_window, 0):
            return
        time.sleep(0.2)


def job_directories(folder):
    for entry in folder.iterdir():
        if JOB_DIRECTORY.fullmatch(entry.name):
            yield entry
        elif (re.fullmatch(r"[A-Z0-9]{20}", entry.name)
              or re.fullmatch(r"[A-Za-z0-9_-]{1,80} \[[A-Z0-9]{20}\]", entry.name)):
            if not entry.is_dir() or entry.resolve() != entry:
                continue
            yield from (job for job in entry.iterdir() if JOB_DIRECTORY.fullmatch(job.name))


def watch_jobs(folder, executable, auto_rate=False):
    """Open new browser jobs in an explicitly selected, private folder."""
    if not folder.is_dir() or not executable.is_file():
        raise ValueError("Selecciona una carpeta de trabajo existente y una instalación de CE³X 3.2.")
    if auto_rate:
        (folder / ".ce3x-xml-bridge").touch()
    seen = set(job_directories(folder))
    print("Esperando nuevas exportaciones de la app. Pulsa Ctrl+C para detener.", flush=True)
    while True:
        for job in sorted(job_directories(folder)):
            if job in seen or not JOB_DIRECTORY.fullmatch(job.name):
                continue
            if not job.is_dir() or job.resolve().parent != job.parent:
                continue
            if not (job / "ready").is_file():
                continue
            projects = list(job.glob("*.cex"))
            if len(projects) != 1:
                continue
            project = projects[0]
            if not project.is_file() or project.resolve().parent != job or not project.stat().st_size:
                continue
            seen.add(job)
            process = subprocess.Popen([str(executable), str(project)], cwd=executable.parent)
            if auto_rate and request_xml_options(process, project):
                print("Opciones XML solicitadas. Revisa la calificación y confirma el informe en CE³X.", flush=True)
                continue
            print("CEX abierto. Califica el proyecto y genera el XML desde CE³X.", flush=True)
        time.sleep(1)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("cex", type=Path, nargs="?")
    parser.add_argument("xml", type=Path, nargs="?")
    parser.add_argument("--watch", type=Path, metavar="CARPETA_PRIVADA")
    parser.add_argument("--ce3x", type=Path, default=DEFAULT_CE3X)
    parser.add_argument("--auto-rate", action="store_true", help="Calcular y abrir las opciones XML en CE³X 3.2 para cada trabajo de --watch")
    parser.add_argument("--timeout", type=int, default=300)
    args = parser.parse_args()
    if bool(args.watch) == bool(args.cex or args.xml) or (not args.watch and not (args.cex and args.xml)):
        parser.error("Indica CEX y XML, o --watch con una carpeta de trabajo privada.")
    if args.auto_rate and not args.watch:
        parser.error("--auto-rate requiere --watch.")
    try:
        if args.watch:
            watch_jobs(args.watch.resolve(), args.ce3x.resolve(), args.auto_rate)
            return
        collect_xml(args.cex.resolve(), args.xml.resolve(), args.ce3x.resolve(), args.timeout)
    except KeyboardInterrupt:
        return
    except (OSError, ValueError) as error:
        parser.exit(1, f"{error}\n")
    print(f"XML recogido: {args.xml}")


if __name__ == "__main__":
    main()

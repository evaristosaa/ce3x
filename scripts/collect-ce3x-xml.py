"""Open a trusted local CEX in CE3X and collect its newly exported XML."""
import argparse
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


def watch_jobs(folder, executable):
    """Open new browser jobs in an explicitly selected, private folder."""
    if not folder.is_dir() or not executable.is_file():
        raise ValueError("Selecciona una carpeta de trabajo existente y una instalación de CE³X 3.2.")
    seen = set(folder.iterdir())
    print("Esperando nuevas exportaciones de la app. Pulsa Ctrl+C para detener.", flush=True)
    while True:
        for job in sorted(folder.iterdir()):
            if job in seen or not JOB_DIRECTORY.fullmatch(job.name):
                continue
            if not job.is_dir() or job.resolve().parent != folder:
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
            subprocess.Popen([str(executable), str(project)], cwd=executable.parent)
            print("CEX abierto. Califica el proyecto y genera el XML desde CE³X.", flush=True)
        time.sleep(1)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("cex", type=Path, nargs="?")
    parser.add_argument("xml", type=Path, nargs="?")
    parser.add_argument("--watch", type=Path, metavar="CARPETA_PRIVADA")
    parser.add_argument("--ce3x", type=Path, default=DEFAULT_CE3X)
    parser.add_argument("--timeout", type=int, default=300)
    args = parser.parse_args()
    if bool(args.watch) == bool(args.cex or args.xml) or (not args.watch and not (args.cex and args.xml)):
        parser.error("Indica CEX y XML, o --watch con una carpeta de trabajo privada.")
    try:
        if args.watch:
            watch_jobs(args.watch.resolve(), args.ce3x.resolve())
            return
        collect_xml(args.cex.resolve(), args.xml.resolve(), args.ce3x.resolve(), args.timeout)
    except KeyboardInterrupt:
        return
    except (OSError, ValueError) as error:
        parser.exit(1, f"{error}\n")
    print(f"XML recogido: {args.xml}")


if __name__ == "__main__":
    main()

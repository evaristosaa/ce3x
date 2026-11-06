"""Open a trusted local CEX in CE3X and collect its newly exported XML."""
import argparse
import shutil
import subprocess
import tempfile
import time
import xml.etree.ElementTree as ET
from pathlib import Path

DEFAULT_CE3X = Path(r"C:\Program Files (x86)\CE3Xv3.2\ce3xv3.2.exe")
MAX_XML_BYTES = 12 * 1024 * 1024


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


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("cex", type=Path)
    parser.add_argument("xml", type=Path)
    parser.add_argument("--ce3x", type=Path, default=DEFAULT_CE3X)
    parser.add_argument("--timeout", type=int, default=300)
    args = parser.parse_args()
    try:
        collect_xml(args.cex.resolve(), args.xml.resolve(), args.ce3x.resolve(), args.timeout)
    except (OSError, ValueError) as error:
        parser.exit(1, f"{error}\n")
    print(f"XML recogido: {args.xml}")


if __name__ == "__main__":
    main()

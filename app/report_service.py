"""Generate certificates using the installed official CE3X XML renderer."""
import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from threading import BoundedSemaphore
import xml.etree.ElementTree as ET

MAX_XML_BYTES = 12 * 1024 * 1024
REPORT_SLOT = BoundedSemaphore(1)
DEFAULT_RENDERER = Path(r'C:\Program Files (x86)\CE3Xv3.2\moduloXML\xmlcert_20260703\xml2cert.exe')


class ReportError(Exception):
    def __init__(self, message, status=422):
        super().__init__(message)
        self.status = status


def renderer_path():
    return Path(os.environ.get('CE3X_XML2CERT', str(DEFAULT_RENDERER)))


def renderer_command(source, output):
    renderer = renderer_path()
    if os.name != 'nt' and os.environ.get('CE3X_WINE'):
        def windows_path(path):
            return 'Z:' + str(Path(path).resolve()).replace('/', '\\')
        return [os.environ['CE3X_WINE'], str(renderer), windows_path(source), '-o', windows_path(output)]
    return [str(renderer), str(source), '-o', str(output)]


def java_environment():
    env = os.environ.copy()
    paths = [env.get('PATH', '')]
    if os.name == 'nt':
        import winreg
        locations = [(winreg.HKEY_LOCAL_MACHINE, r'SYSTEM\CurrentControlSet\Control\Session Manager\Environment'),
                     (winreg.HKEY_CURRENT_USER, r'Environment')]
        for hive, key in locations:
            try:
                with winreg.OpenKey(hive, key) as handle:
                    paths.append(os.path.expandvars(winreg.QueryValueEx(handle, 'Path')[0]))
            except OSError:
                pass
    if env.get('JAVA_HOME'):
        paths.insert(0, str(Path(env['JAVA_HOME']) / 'bin'))
    env['PATH'] = os.pathsep.join(paths)
    return env


def report_status():
    if not renderer_path().is_file():
        return {'available': False, 'message': 'La generación de PDF requiere el servidor con el módulo oficial de CE3X 3.2 instalado.'}
    windows_java = os.environ.get('CE3X_WINDOWS_JAVA')
    if not ((windows_java and Path(windows_java).is_file()) or shutil.which('java', path=java_environment()['PATH'])):
        return {'available': False, 'message': 'El servidor no encuentra Java. Instálalo antes de generar el informe.'}
    return {'available': True, 'message': 'Generador oficial de CE3X disponible. El XML se procesa temporalmente en este servidor.'}


def generate_report(xml_bytes):
    if not xml_bytes or len(xml_bytes) > MAX_XML_BYTES:
        raise ReportError('Selecciona un XML de hasta 12 MB.', 413)
    # Never resolve external entities or DTDs in user-supplied XML.
    if b'\x00' in xml_bytes or b'<!DOCTYPE' in xml_bytes.upper() or b'<!ENTITY' in xml_bytes.upper():
        raise ReportError('Se admite XML UTF-8 sin DTD ni entidades externas.')
    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError:
        raise ReportError('El archivo no es un XML válido.')
    if root.tag.rsplit('}', 1)[-1] != 'DatosEnergeticosDelEdificio':
        raise ReportError('El XML no contiene un certificado energético de edificio.')
    status = report_status()
    if not status['available']:
        raise ReportError(status['message'], 503)
    if not REPORT_SLOT.acquire(blocking=False):
        raise ReportError('Se está generando otro informe. Vuelve a intentarlo cuando termine.', 429)
    try:
        with tempfile.TemporaryDirectory(prefix='ce3x-report-') as folder:
            work = Path(folder)
            source = work / 'certificado.xml'
            output = work / 'output'
            output.mkdir()
            source.write_bytes(xml_bytes)
            try:
                result = subprocess.run(
                    renderer_command(source, output),
                    cwd=renderer_path().parent, env=java_environment(),
                    capture_output=True, timeout=120, check=False,
                    creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0),
                )
            except subprocess.TimeoutExpired:
                raise ReportError('El generador no ha terminado en dos minutos. Revisa el XML.', 504)
            except OSError:
                raise ReportError('No se ha podido iniciar el generador oficial en este servidor.', 503)
            pdf = output / 'certificado.pdf'
            if result.returncode or not pdf.is_file():
                details = (result.stderr or result.stdout).decode('utf-8', errors='replace')[-6000:]
                log = output / 'certificado.log'
                if log.is_file():
                    details = log.read_text(encoding='utf-8', errors='replace')[-6000:] or details
                # Do not disclose server directories in browser errors.
                details = details.replace(str(work), '[temporal]').replace(str(renderer_path().parent), '[generador]')
                raise ReportError(f'El módulo oficial no ha podido generar el PDF (salida {result.returncode}). ' + details)
            content = pdf.read_bytes()
            if not content.startswith(b'%PDF-'):
                raise ReportError('El generador no ha devuelto un PDF válido.')
            return content
    finally:
        REPORT_SLOT.release()

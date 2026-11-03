"""Run only public vendor examples at build time; no real certificates."""
from pathlib import Path
import os
import subprocess
from report_service import generate_report, java_environment

for command in [
    [os.environ['CE3X_WINE'], os.environ['CE3X_XML2CERT'], '--version'],
    [os.environ['CE3X_WINE'], os.environ['CE3X_WINDOWS_JAVA'], '-version'],
]:
    result = subprocess.run(command, capture_output=True, timeout=60, env=java_environment())
    print('PREFLIGHT', Path(command[1]).name, 'exit', result.returncode, flush=True)
    print(result.stdout.decode('utf-8',errors='replace')[:3000], flush=True)
    print(result.stderr.decode('utf-8',errors='replace')[:3000], flush=True)
    if result.returncode: raise RuntimeError('Native executable preflight failed')

example = Path('/opt/xmlcert/examples/Ejemplo30_Informe.xml')
pdf = generate_report(example.read_bytes())
if not pdf.startswith(b'%PDF-') or len(pdf) < 10000:
    raise RuntimeError('Official example did not generate a valid PDF')
print('SMOKE_OK: XmlCert 0.7.0 + Temurin 17 + Wine generated the official example.')


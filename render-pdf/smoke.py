"""Run only public vendor examples at build time; no real certificates."""
from pathlib import Path
from report_service import generate_report

example = Path('/opt/xmlcert/examples/Ejemplo30_Informe.xml')
pdf = generate_report(example.read_bytes())
if not pdf.startswith(b'%PDF-') or len(pdf) < 10000:
    raise RuntimeError('Official example did not generate a valid PDF')
print('SMOKE_OK: XmlCert 0.7.0 + Temurin 17 + Wine generated the official example.')


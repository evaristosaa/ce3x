"""Fetch pinned vendor distributions and verify their published SHA256 hashes."""
import hashlib
import io
import shutil
import tempfile
import urllib.request
import zipfile
from pathlib import Path

PACKAGES = [
    ('https://energia.ietcc.csic.es/files/xmlcert_0.7.0_20261028.zip',
     'ec361d82309890a8af6a3fcd074cc4a1d5d498a7c2f5c13d5080c4b39b081db2', Path('/opt/xmlcert'), False),
    ('https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.21%2B9/OpenJDK17U-jre_x64_windows_hotspot_17.0.21_9.zip',
     'fe4656bd78fb09812dc38c49da777f79cc33e7ee435a254be82f9e7f40d9d117', Path('/opt/java'), True),
]

for url, digest, destination, strip_root in PACKAGES:
    request = urllib.request.Request(url, headers={'User-Agent':'CE3X-PDF-build/1.0'})
    with urllib.request.urlopen(request, timeout=120) as response:
        data = response.read()
    if hashlib.sha256(data).hexdigest() != digest:
        raise RuntimeError('Checksum mismatch for ' + url)
    destination.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        for member in archive.infolist():
            parts = Path(member.filename).parts
            if strip_root: parts = parts[1:]
            if not parts: continue
            target = destination.joinpath(*parts)
            if not target.resolve().is_relative_to(destination.resolve()):
                raise RuntimeError('Invalid archive member')
            if member.is_dir(): target.mkdir(parents=True, exist_ok=True)
            else:
                target.parent.mkdir(parents=True, exist_ok=True)
                with archive.open(member) as source, target.open('wb') as output:
                    shutil.copyfileobj(source, output)


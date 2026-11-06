"""Build an explicit public-source manifest; never include diagnostics or records."""
from pathlib import Path
import base64
import json
import shutil
import sys
import hashlib

ROOT = Path(__file__).resolve().parents[1]
UI_FILES = ['index.html', 'app.js', 'styles.css', 'workspace.js', 'workspace.css',
            'reports.js', 'cex-import.js', 'cex-32.js', 'ce3x-locations.js',
            'estimation-model.js', 'estimation-ui.js', 'references-ui.js', 'review-model.js', 'review-ui.js',
            'solar-tables.js', 'solar-model.js', 'solar-ui.js',
            'templates/base-3.2.cex']
for name in UI_FILES:
    target = ROOT / 'docs' / name
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(ROOT / 'app' / name, target)
source = (ROOT / 'google-apps-script/Code.gs').read_text(encoding='utf-8-sig')
if "const APP_SECRET = 'CAMBIAR_ESTE_SECRETO';" not in source:
    raise SystemExit('Refusing to publish configured Apps Script secret')
if "const GOOGLE_MAPS_API_KEY = '';" not in source:
    raise SystemExit('Refusing to publish configured Maps key')
(ROOT / 'docs/Code.gs.txt').write_text(source, encoding='utf-8')
names = [prefix + name for prefix in ['app/', 'docs/'] for name in UI_FILES]
names += ['app/server.py', 'app/report_service.py', 'app/estimation_service.py', 'google-apps-script/Code.gs',
          'docs/Code.gs.txt', 'docs/sheet-schema.md', '.gitignore',
          'tests/cex-32.test.mjs', 'README.md', 'docs/roadmap-3.2.md',
          'scripts/prepare-release.py', 'scripts/create-cex32-test.mjs',
          'scripts/estimate-systems.py', 'scripts/engine/NativePython27.cs',
          'scripts/engine/estimate_worker.py', 'scripts/engine/check_building_runtime.py', 'tests/test_estimate_systems.py',
          'docs/engine-adapter.md', 'docs/full-engine-integration.md',
          'docs/consulta-integracion-CE3X.md', 'docs/validation-bridges-3.2.md', 'tests/test_estimation_http.py',
          'docs/data-review.md','tests/fixtures/sheet-headers-103.json',
          'scripts/generate-solar-reference.py','scripts/engine/solar_reference_worker.py',
          'tests/fixtures/solar-ce3x32.json','docs/solar-protections.md']
if '--meta' in sys.argv:
    print(json.dumps([{'path':name, 'size':(ROOT/name).stat().st_size,
                       'sha':hashlib.sha1(b'blob '+str((ROOT/name).stat().st_size).encode()+b'\0'+(ROOT/name).read_bytes()).hexdigest()}
                      for name in names]))
elif '--json' in sys.argv:
    print(json.dumps([{'path':name, 'base64':base64.b64encode((ROOT/name).read_bytes()).decode()}
                      for name in names]))
else:
    print(json.dumps({'files':names}))

"""Write numerical component fixtures from an installed CE3X 3.2 runtime."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile

ROOT=Path(__file__).resolve().parents[1]

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root',type=Path,default=Path(r'C:\Program Files (x86)\CE3Xv3.2'))
    parser.add_argument('--output',type=Path,required=True)
    parser.add_argument('--kind',choices=('solar','window'),default='solar')
    args=parser.parse_args()
    if os.name!='nt':raise SystemExit('Requires Windows and an installed CE3X 3.2 runtime.')
    if not (args.root/'ce3xv3.2.exe').is_file():raise SystemExit('Installed runtime not found.')
    compiler=Path(os.environ.get('WINDIR',r'C:\Windows'))/'Microsoft.NET/Framework/v4.0.30319/csc.exe'
    with tempfile.TemporaryDirectory(prefix='ce3x32-solar-') as directory:
        host=Path(directory)/'native-python.exe'
        subprocess.run([str(compiler),'/nologo','/platform:x86','/out:'+str(host),str(ROOT/'scripts/engine/NativePython27.cs')],check=True,capture_output=True,timeout=30)
        worker=ROOT/'scripts/engine'/('solar_reference_worker.py' if args.kind=='solar' else 'window_reference_worker.py')
        run=subprocess.run([str(host),str(args.root),str(worker)],check=True,capture_output=True,timeout=30,creationflags=subprocess.CREATE_NO_WINDOW)
        result=json.loads(run.stdout.decode('utf-8'))
    modules=('ce3xv3.2.exe','Calculos/funcionFactorSombra.pyd','Envolvente/tablasValores.pyd') if args.kind=='solar' else ('ce3xv3.2.exe','Envolvente/objetosEnvolvente.pyd')
    result['moduleHashes']={name:hashlib.sha256((args.root/name).read_bytes()).hexdigest() for name in modules}
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'cases':len(result['cases']),'output':str(args.output),'moduleHashes':result['moduleHashes']}))

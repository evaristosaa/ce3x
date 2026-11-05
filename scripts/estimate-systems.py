"""Run the installed Windows CE3X 3.2 estimation module with restricted JSON."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile

ENGINE = Path(__file__).resolve().parent / 'engine'


def run_worker(payload, root=None, worker='estimate_worker.py'):
    if worker not in ('estimate_worker.py','check_building_runtime.py'):
        raise ValueError('Unsupported worker')
    if os.name != 'nt':
        raise RuntimeError('This adapter requires Windows and an installed CE3X 3.2 runtime.')
    root = Path(root or os.environ.get('CE3X_ENGINE_ROOT', r'C:\Program Files (x86)\CE3Xv3.2'))
    executable = root / 'ce3xv3.2.exe'
    if not executable.is_file() or not (root / 'python27.dll').is_file():
        raise RuntimeError('CE3X 3.2 is not installed in the configured directory.')
    compiler = Path(os.environ.get('WINDIR', r'C:\Windows')) / 'Microsoft.NET/Framework/v4.0.30319/csc.exe'
    if not compiler.is_file():
        raise RuntimeError('The .NET Framework C# compiler is required for the 32-bit host.')
    request = json.dumps(payload, ensure_ascii=True, allow_nan=False).encode('ascii')
    if len(request) > 65536:
        raise ValueError('Request exceeds 64 KiB')
    with tempfile.TemporaryDirectory(prefix='ce3x32-estimate-') as folder:
        host = Path(folder) / 'native-python.exe'
        built = subprocess.run([str(compiler), '/nologo', '/platform:x86', '/out:'+str(host),
                                str(ENGINE / 'NativePython27.cs')], capture_output=True, timeout=30)
        if built.returncode:
            raise RuntimeError('Could not compile the native Python host.')
        try:
            run = subprocess.run([str(host), str(root), str(ENGINE / worker)],
                                 input=request, capture_output=True, timeout=30,
                                 creationflags=subprocess.CREATE_NO_WINDOW, cwd=root)
        except subprocess.TimeoutExpired as error:
            raise RuntimeError('The official runtime timed out after 30 seconds.') from error
        try:
            result = json.loads(run.stdout.decode('utf-8'))
        except (UnicodeError, json.JSONDecodeError) as error:
            raise RuntimeError('The official runtime did not return structured results.') from error
        if run.returncode or not result.get('ok'):
            raise ValueError(result.get('error', 'The official runtime failed.'))
        result['runtimeExecutableSha256'] = hashlib.sha256(executable.read_bytes()).hexdigest()
        module=root/'Instalaciones/funcionCalculoRendimientoEstacional.pyd'
        result['seasonalModuleSha256'] = hashlib.sha256(module.read_bytes()).hexdigest()
        return result


def estimate(payload, root=None):
    return run_worker(payload,root)


def check_building_runtime(root=None):
    return run_worker({},root,'check_building_runtime.py')


def probe_request():
    return {'context': {'zone':'B4','buildingType':'Unifamiliar'}, 'systems':[
        {'id':'boiler-reference','service':'ACS','generator':'Caldera Estándar','fuel':'GLP',
         'parameters':{'aislanteCaldera':'Bien aislada y mantenida','rendCombCaldera':90,
                       'potenciaCaldera':24,'cargaMediaCaldera':0.2,'vectorTipoCaldera':[0,0,1,0,0,1,0]}},
        {'id':'heat-pump-reference','service':'climatizacion','generator':'Bomba de Calor','fuel':'Electricidad',
         'parameters':{'rendNominalCal':220,'rendNominalRef':200,'rendNominalPG':220,'rendNominal':220,
                       'variosGeneradoresCheck':False,'fraccionPotencia':1,'fraccionPotenciaEntrada':0}},
    ]}


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root',type=Path)
    mode=parser.add_mutually_exclusive_group()
    mode.add_argument('--probe',action='store_true',help='Check three known reference performances.')
    mode.add_argument('--check-building-runtime',action='store_true',help='Inspect full-building prerequisites without loading a project or overriding checks.')
    args=parser.parse_args()
    try:
        result=check_building_runtime(args.root) if args.check_building_runtime else estimate(probe_request() if args.probe else json.load(sys.stdin),args.root)
        if args.probe:
            expected=[{'ACS':77.2},{'calefaccion':153.0,'refrigeracion':113.9}]
            if [item['seasonalPerformancePercent'] for item in result['systems']] != expected:
                raise RuntimeError('Official module results differ from the reference cases.')
            result['referenceCheck']='passed'
        print(json.dumps(result,ensure_ascii=True,allow_nan=False))
    except Exception as error:
        print(json.dumps({'ok':False,'error':str(error)},ensure_ascii=True))
        sys.exit(1)

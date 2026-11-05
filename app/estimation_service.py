"""Local-only adapter endpoint for the installed official installation module."""
import importlib.util
import os
import subprocess
from pathlib import Path
from threading import BoundedSemaphore

SCRIPT=Path(__file__).resolve().parents[1]/'scripts/estimate-systems.py'
SLOT=BoundedSemaphore(1)
MAX_ESTIMATION_BYTES=65536


class EstimationError(Exception):
    def __init__(self,message,status=422):
        super().__init__(message)
        self.status=status


def estimation_status():
    root=Path(os.environ.get('CE3X_ENGINE_ROOT',r'C:\Program Files (x86)\CE3Xv3.2'))
    compiler=Path(os.environ.get('WINDIR',r'C:\Windows'))/'Microsoft.NET/Framework/v4.0.30319/csc.exe'
    available=os.name=='nt' and SCRIPT.is_file() and (root/'ce3xv3.2.exe').is_file() and (root/'python27.dll').is_file() and compiler.is_file()
    return {'available':available,'message':('Módulo oficial local de CE³X 3.2 disponible. Solo calcula rendimientos de instalaciones.' if available else 'El recálculo requiere el servidor local de Windows con CE³X 3.2 instalado. Puedes guardar los parámetros para revisarlos después.')}


def estimate_systems(payload):
    status=estimation_status()
    if not status['available']: raise EstimationError(status['message'],503)
    if not SLOT.acquire(blocking=False): raise EstimationError('Hay otro cálculo de instalaciones en curso. Inténtalo de nuevo al terminar.',429)
    try:
        spec=importlib.util.spec_from_file_location('ce3x_estimator',SCRIPT)
        estimator=importlib.util.module_from_spec(spec)
        spec.loader.exec_module(estimator)
        return estimator.estimate(payload)
    except ValueError as error:
        raise EstimationError('Revisa los parámetros de la instalación: '+str(error)) from error
    except (OSError,RuntimeError,subprocess.SubprocessError) as error:
        raise EstimationError('No se ha podido completar el cálculo con el módulo local de CE³X 3.2.',503) from error
    finally:
        SLOT.release()

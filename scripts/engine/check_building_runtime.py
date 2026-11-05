# -*- coding: utf-8 -*-
"""Inspect prerequisites without loading a project or overriding CE3X checks."""
from __future__ import unicode_literals
import json
import os
import sys
import tempfile

try:
    root=os.environ['PYTHONHOME']
    os.environ['MATPLOTLIBDATA']=os.path.join(root,'mpl-data')
    # A private temporary cache avoids changes to the installed program directory.
    cache=tempfile.mkdtemp(prefix='ce3x32-building-probe-')
    os.environ['MPLCONFIGDIR']=cache
    import wx
    app=wx.App(False)
    import datosEdificio
    context=datosEdificio.getVG3()
    report={'ok':True,'scope':'prerequisite check only; no building energy rating',
            'checks':{'graphicsModuleImported':True,'applicationContextInitialized':True,
                      'buildingModuleImported':True,'contextVerified':bool(context),
                      'projectLoaded':False,'buildingRatingCompared':False},
            'buildingCalculationValidated':False,
            'nextStep':'Obtain a supported initialization contract for the full CE3X application context; do not override verification results.'}
    sys.stdout.write(json.dumps(report,ensure_ascii=True)+'\n')
except Exception as error:
    sys.stdout.write(json.dumps({'ok':False,'error':unicode(error)},ensure_ascii=True)+'\n')
    sys.exit(1)
finally:
    if 'cache' in globals():
        import shutil
        shutil.rmtree(cache,ignore_errors=True)

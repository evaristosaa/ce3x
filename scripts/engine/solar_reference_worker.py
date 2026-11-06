# -*- coding: utf-8 -*-
"""Generate numerical reference cases using the installed CE3X 3.2 modules.

No projects, UI state or verification functions are loaded or modified.
"""
from __future__ import unicode_literals
import gettext
import json
import random
gettext.NullTranslations().install(unicode=True)
from Calculos import funcionFactorSombra as solar
from Envolvente.tablasValores import obtenerCorrectoresFactorSolar


def combined(orientation, overhang, recess):
    args=[orientation]+['']*31
    args[7]=['',0,0]
    args[8]=['',0,0]
    if overhang:
        args[1:4]=[str(overhang['L']),str(overhang['D']),str(overhang['H'])]
    if recess:
        args[4:7]=[str(recess['H']),str(recess['W']),str(recess['R'])]
    return obtenerCorrectoresFactorSolar(*args)[0]


tables={'overhang':{},'recess':{}}
for orientation in ('Sur','SE','Este'):
    tables['overhang'][orientation]=[[[solar.Factor_Sombra_Voladizos(l,1,d,orientation)]+list(solar.Factor_Sombra_Voladizos_Calculos(l,1,d,orientation)) for l in (.35,.75,1.5,3)] for d in (.1,.35,.75)]
    tables['recess'][orientation]=[[[solar.Factor_Sombra_Retranqueo(1,1/h,1/w,orientation)]+list(solar.Factor_Sombra_Retranqueo_Calculos(1,1/h,1/w,orientation)) for w in (.075,.15,.35,.75)] for h in (.075,.15,.35,.75)]

cases=[]
def add(orientation,overhang=None,recess=None):
    cases.append({'orientation':orientation,'overhang':overhang,'recess':recess,'expected':combined(orientation,overhang,recess)})

orientations=('Norte','NE','Este','SE','Sur','SO','Oeste','NO')
for orientation in orientations:
    add(orientation)
    for l in (0,.199999,.2,.200001,.5,.500001,1,1.000001,2,2.000001):
        for d in (0,.2,.200001,.5,.500001,1):
            add(orientation,{'L':l,'D':d,'H':1})
    for rh in (.049999,.05,.050001,.1,.100001,.2,.200001,.5,.500001):
        for rw in (.049999,.05,.050001,.1,.100001,.2,.200001,.5,.500001):
            add(orientation,recess={'R':1,'H':1/rh,'W':1/rw})

random.seed(20261106)
for index in range(160):
    height=random.uniform(.5,3.)
    overhang={'H':height,'L':random.uniform(0,4)*height,'D':random.uniform(0,1)*height}
    recess={'R':random.uniform(.01,1),'H':random.uniform(.5,3),'W':random.uniform(.5,3)}
    add(orientations[index%8],overhang,recess)

print(json.dumps({'schema':1,'engine':'Installed CE3X 3.2 solar-factor functions','tables':tables,'cases':cases},ensure_ascii=True,allow_nan=False))

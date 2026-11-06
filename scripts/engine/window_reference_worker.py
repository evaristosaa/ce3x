# -*- coding: utf-8 -*-
"""Numerical window-property references; never loads a project or changes verification."""
from __future__ import unicode_literals
import json,gettext
gettext.NullTranslations().install(unicode=True)
from Envolvente.objetosEnvolvente import HuecoConocidas,HuecoEstimadas

def inputs():
    return ['Reference','Hueco','2','Sur','20',[1.,1.,1.],'Facade','Estanco','50','.3',[7,1],False,['','','','','','',['',0,0],['',0,0],'',0,0,'',0,0,'','','',0,0,0,0,0,0,0,['','']],'Sin patron',False,'1','2','1','','','1.4','.52','2.2','Doble','Metálico con RPT','','','Edificio Objeto']

cases=[]
for glass in ('Simple','Doble','Doble bajo emisivo'):
    for frame in ('Metálico sin RPT','Metálico con RPT','PVC','Madera'):
        for double in (False,True):
            for percent in (0,20,100):
                d=inputs();d[23]=glass;d[24]=frame;d[14]=double;d[4]=str(percent)
                item=HuecoEstimadas(d)
                cases.append({'mode':'Estimadas','glass':glass,'frame':frame,'double':double,'percent':percent,'expected':[item.Uvidrio,item.Gvidrio,item.Umarco,item.calculoUhueco(),item.calculoFShueco()]})
for ug,g,uf in ((1.4,.52,2.2),(3.3,.75,4),(5.7,.82,5.7),(.8,.4,1.1)):
    for double in (False,True):
        for percent in (0,20,100):
            d=inputs();d[20:23]=[str(ug),str(g),str(uf)];d[14]=double;d[4]=str(percent)
            item=HuecoConocidas(d)
            cases.append({'mode':'Conocidas','ug':ug,'g':g,'uf':uf,'double':double,'percent':percent,'expected':[item.Uvidrio,item.Gvidrio,item.Umarco,item.calculoUhueco(),item.calculoFShueco()]})
print(json.dumps({'schema':1,'engine':'Installed CE3X 3.2 window property classes','cases':cases},ensure_ascii=True,allow_nan=False))

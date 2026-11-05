# -*- coding: utf-8 -*-
"""Restricted JSON worker for the installed CE3X 3.2 seasonal-performance module.

Executed with CE3X's Python 2.7 runtime. No CEX unpickling, eval, UI automation,
or modifications to CE3X verification functions are performed.
"""
from __future__ import unicode_literals
import json
import math
import sys

SERVICES = ('ACS', 'calefaccion', 'refrigeracion', 'climatizacion')
NUMBERS = ('rendCombCaldera', 'potenciaCaldera', 'cargaMediaCaldera',
           'rendNominalACS', 'rendNominalCal', 'rendNominalRef', 'rendNominalPG',
           'rendNominal', 'fraccionPotencia', 'fraccionPotenciaEntrada')
FIELDS = NUMBERS + ('aislanteCaldera', 'vectorTipoCaldera', 'variosGeneradoresCheck')


def numeric(value, name, minimum=0, maximum=None):
    if isinstance(value, bool) or not isinstance(value, (int, long, float)):
        raise ValueError('Expected numeric parameter: ' + name)
    if math.isnan(value) or math.isinf(value) or value < minimum or (maximum is not None and value > maximum):
        raise ValueError('Out of range: ' + name)
    return value


def calculate(request):
    if not isinstance(request, dict) or set(request) != set(('context', 'systems')):
        raise ValueError('Expected context and systems')
    context = request['context']
    if not isinstance(context, dict) or set(context) != set(('zone', 'buildingType')):
        raise ValueError('Expected zone and buildingType')
    if context['zone'] not in ('alpha1','alpha2','alpha3','alpha4','A1','A2','A3','A4','B1','B2','B3','B4','C1','C2','C3','C4','D1','D2','D3','E1'):
        raise ValueError('Unsupported climate zone')
    if context['buildingType'] not in ('Unifamiliar','Bloque de viviendas','Vivienda individual'):
        raise ValueError('Residential use only')
    systems=request['systems']
    if not isinstance(systems,list) or not 1 <= len(systems) <= 100:
        raise ValueError('Expected 1 to 100 systems')
    from Instalaciones.funcionCalculoRendimientoEstacional import calculoRendimientoMedioEstacional
    result=[]
    ids=set()
    for system in systems:
        if not isinstance(system,dict) or set(system) != set(('id','service','generator','fuel','parameters')):
            raise ValueError('Unexpected system fields')
        identifier=system['id']
        if not isinstance(identifier,basestring) or not identifier or len(identifier)>100 or identifier in ids:
            raise ValueError('System identifiers must be unique nonempty strings')
        ids.add(identifier)
        service=system['service']
        if service not in SERVICES:
            raise ValueError('Unsupported service')
        generator=system['generator']
        if generator not in ('Caldera Est\u00e1ndar','Bomba de Calor','Efecto Joule'):
            raise ValueError('Unsupported generator')
        if system['fuel'] not in ('GLP','Gas Natural','Gas\u00f3leo-C','Electricidad','Biomasa'):
            raise ValueError('Unsupported fuel')
        parameters=system['parameters']
        if not isinstance(parameters,dict) or set(parameters)-set(FIELDS):
            raise ValueError('Unknown estimation parameter')
        kwargs=dict(parameters)
        for name in NUMBERS:
            if name in kwargs:
                numeric(kwargs[name],name)
        for name in ('cargaMediaCaldera','fraccionPotencia','fraccionPotenciaEntrada'):
            if name in kwargs:
                numeric(kwargs[name],name,0,1)
        if 'variosGeneradoresCheck' in kwargs and not isinstance(kwargs['variosGeneradoresCheck'],bool):
            raise ValueError('Expected a boolean for staged generators')
        if 'vectorTipoCaldera' in kwargs:
            vector=kwargs['vectorTipoCaldera']
            if not isinstance(vector,list) or len(vector)!=7 or any(type(v) not in (int,long) or v not in (0,1) for v in vector):
                raise ValueError('Expected seven boiler characteristic flags')
        if generator=='Caldera Est\u00e1ndar':
            required=('aislanteCaldera','rendCombCaldera','potenciaCaldera','cargaMediaCaldera','vectorTipoCaldera')
            if service not in ('ACS','calefaccion') or any(k not in kwargs for k in required):
                raise ValueError('Incomplete boiler estimation')
            if system['fuel']=='Electricidad':
                raise ValueError('A combustion boiler cannot use electricity as its fuel')
            if kwargs['aislanteCaldera'] not in ('Sin aislamiento','Antigua con mal aislamiento','Antigua con aislamiento medio','Bien aislada y mantenida'):
                raise ValueError('Unsupported boiler insulation')
            if not 0 < kwargs['rendCombCaldera'] <= 100 or kwargs['potenciaCaldera'] <= 0 or kwargs['cargaMediaCaldera'] <= 0:
                raise ValueError('Boiler power, combustion efficiency and load must be positive')
        elif generator=='Bomba de Calor':
            required={'ACS':('rendNominalACS',),'calefaccion':('rendNominalCal',),
                      'refrigeracion':('rendNominalRef',),'climatizacion':('rendNominalCal','rendNominalRef')}[service]
            if any(kwargs.get(k,0)<=0 for k in required) or system['fuel']!='Electricidad':
                raise ValueError('Incomplete electric heat-pump estimation')
        elif service not in ('ACS','calefaccion') or kwargs.get('rendNominal',0)<=0 or system['fuel']!='Electricidad':
            raise ValueError('Incomplete Joule estimation')
        kwargs.update(zonaHE1=context['zone'],programa='Residencial',tipoEdificio=context['buildingType'],
                      usoEdificio='Residencial',tipoInstalacion=service,
                      modoDefinicion='Estimado seg\u00fan Instalaci\u00f3n',tipoEquipo=generator,combustible=system['fuel'])
        value=calculoRendimientoMedioEstacional(**kwargs)
        if service=='climatizacion':
            values={'calefaccion':value[0],'refrigeracion':value[1]}
        else:
            values={service:value[0] if isinstance(value,(tuple,list)) else value}
        for name,number in values.items():
            numeric(number,name,0)
            if number<=0: raise ValueError('Official module returned no valid performance')
        result.append({'id':identifier,'seasonalPerformancePercent':values})
    return {'ok':True,'engine':'CE3X 3.2 installed seasonal-performance module',
            'scope':'installation estimation only; not a building energy rating','systems':result}


try:
    raw=sys.stdin.read(65537)
    if len(raw)>65536: raise ValueError('Request exceeds 64 KiB')
    answer=calculate(json.loads(raw.decode('utf-8')))
    sys.stdout.write(json.dumps(answer,ensure_ascii=True,allow_nan=False)+'\n')
except Exception as error:
    sys.stdout.write(json.dumps({'ok':False,'error':unicode(error)},ensure_ascii=True)+'\n')
    sys.exit(1)

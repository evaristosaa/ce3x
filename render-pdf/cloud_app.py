"""Small, authenticated WSGI endpoint for the Render compatibility trial."""
import hmac
import json
import os
from pathlib import Path

from report_service import MAX_XML_BYTES, ReportError, generate_report


def respond(start_response, status, payload, content_type='application/json; charset=utf-8', extra=()):
    data = payload if isinstance(payload, bytes) else json.dumps(payload, ensure_ascii=False).encode('utf-8')
    start_response(status, [('Content-Type', content_type), ('Content-Length', str(len(data))),
                            ('Cache-Control', 'no-store'), ('X-Content-Type-Options','nosniff'),
                            ('Referrer-Policy','no-referrer'), *extra])
    return [data]


def application(environ, start_response):
    method, path = environ.get('REQUEST_METHOD', 'GET'), environ.get('PATH_INFO', '/')
    if method == 'GET' and path == '/healthz':
        return respond(start_response, '200 OK', {'status':'ok','mode':'render-free-trial'})
    if method == 'GET' and path == '/':
        return respond(start_response, '200 OK', Path(__file__).with_name('index.html').read_bytes(), 'text/html; charset=utf-8',
                       [('Content-Security-Policy', "default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'")])
    if path == '/api/report':
        origin = environ.get('HTTP_ORIGIN')
        cors = [('Vary', 'Origin')]
        if origin == 'https://evaristosaa.github.io':
            cors.append(('Access-Control-Allow-Origin', origin))
        original_start = start_response

        def start_response(status, headers):
            return original_start(status, [*headers, *cors])

        if method == 'OPTIONS' and len(cors) == 2:
            return respond(start_response, '200 OK', b'', extra=[
                ('Access-Control-Allow-Methods', 'POST'),
                ('Access-Control-Allow-Headers', 'Authorization, Content-Type'),
            ])
    if path != '/api/report' or method != 'POST':
        return respond(start_response, '404 Not Found', {'error':'Ruta no disponible.'})
    token = os.environ.get('PDF_ACCESS_TOKEN', '')
    if not token:
        return respond(start_response, '503 Service Unavailable', {'error':'Falta configurar el acceso de la prueba.'})
    auth = environ.get('HTTP_AUTHORIZATION', '')
    if not auth.startswith('Bearer ') or not hmac.compare_digest(auth[7:], token):
        return respond(start_response, '401 Unauthorized', {'error':'La clave de acceso no es correcta.'})
    if environ.get('CONTENT_TYPE','').split(';')[0] != 'application/xml':
        return respond(start_response, '415 Unsupported Media Type', {'error':'Selecciona un archivo XML.'})
    try:
        size = int(environ.get('CONTENT_LENGTH','0'))
    except ValueError:
        size = 0
    if not 0 < size <= MAX_XML_BYTES:
        return respond(start_response, '413 Content Too Large', {'error':'El XML debe ocupar entre 1 byte y 12 MB.'})
    content = environ['wsgi.input'].read(size)
    if len(content) != size:
        return respond(start_response, '400 Bad Request', {'error':'La transferencia del XML está incompleta.'})
    try:
        pdf = generate_report(content)
    except ReportError as error:
        labels = {413:'Content Too Large',422:'Unprocessable Content',429:'Too Many Requests',503:'Service Unavailable',504:'Gateway Timeout'}
        # A private XML can contain personal data in validation errors. Do not log it or expose raw diagnostics.
        message = 'El generador no ha podido procesar el XML.' if error.status == 422 else str(error)
        return respond(start_response, f'{error.status} {labels.get(error.status,"Error")}', {'error':message})
    return respond(start_response, '200 OK', pdf, 'application/pdf',
                   [('Content-Disposition','attachment; filename="certificado.pdf"')])


#!/usr/bin/env python3
import html
import io
import json
import pickle
import re
import sys
import types
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen


HOST = "0.0.0.0"
PORT = 5177
MAX_BODY_BYTES = 1024 * 1024
MAX_GET_URL_BYTES = 6000
WRITE_ACTIONS = {"save", "patch", "delete", "markGenerated"}
BASE_CEX = Path(__file__).with_name("templates") / "base.cex"


class GenericPickleObject:
    def __init__(self, *args, **kwargs):
        pass


def ensure_module(module_name):
    parent = None
    current = ""
    for part in module_name.split("."):
        current = part if not current else current + "." + part
        if current not in sys.modules:
            sys.modules[current] = types.ModuleType(current)
        if parent is not None:
            setattr(parent, part, sys.modules[current])
        parent = sys.modules[current]
    return sys.modules[module_name]


class CexUnpickler(pickle.Unpickler):
    def find_class(self, module, name):
        module_obj = ensure_module(module)
        if not hasattr(module_obj, name):
            cls = type(name, (GenericPickleObject,), {"__module__": module})
            setattr(module_obj, name, cls)
        return getattr(module_obj, name)


class Ce3xHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_POST(self):
        if self.path.split("?", 1)[0] == "/api/apps-script":
            self.handle_apps_script_proxy()
            return
        if self.path.split("?", 1)[0] == "/api/cex":
            self.send_error(404, "Generador .cex servidor desactivado temporalmente")
            return
        self.send_error(404, "Not found")

    def handle_cex_generation(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > MAX_BODY_BYTES:
                raise ValueError("Peticion .cex vacia o demasiado grande")
            envelope = json.loads(self.rfile.read(length).decode("utf-8"))
            record = envelope.get("record") or {}
            filename = str(envelope.get("filename") or "expediente.cex")
            body = generate_cex(record)
            self.send_response(200)
            self.send_header("Content-Type", "application/octet-stream")
            self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except Exception as error:
            self.write_json(400, {"ok": False, "error": str(error)})

    def handle_apps_script_proxy(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > MAX_BODY_BYTES:
                raise ValueError("Peticion vacia o demasiado grande")

            envelope = json.loads(self.rfile.read(length).decode("utf-8"))
            api_url = str(envelope.get("apiUrl") or "").strip()
            payload = envelope.get("payload") or {}
            self.validate_apps_script_url(api_url)

            data = self.call_apps_script(api_url, payload)

            self.write_json(200, data)
        except HTTPError as error:
            detail = error.read().decode("utf-8", errors="replace")
            self.write_json(502, {"ok": False, "error": f"Apps Script HTTP {error.code}: {detail[:500]}"})
        except (URLError, TimeoutError) as error:
            self.write_json(502, {"ok": False, "error": f"No se pudo contactar con Apps Script: {error}"})
        except Exception as error:
            self.write_json(400, {"ok": False, "error": str(error)})

    def call_apps_script(self, api_url, payload):
        payload_text = json.dumps(payload, separators=(",", ":"))
        action = str(payload.get("action") or "")
        get_url = api_url + "?" + urlencode({"payload": payload_text})
        if action not in WRITE_ACTIONS and len(get_url.encode("utf-8")) <= MAX_GET_URL_BYTES:
            request = Request(get_url, method="GET")
        else:
            request = Request(
                api_url,
                data=urlencode({"payload": payload_text}).encode("utf-8"),
                headers={"Content-Type": "application/x-www-form-urlencoded;charset=utf-8"},
                method="POST",
            )

        with urlopen(request, timeout=30) as response:
            raw = response.read().decode("utf-8", errors="replace")
            content_type = response.headers.get("Content-Type", "")
            return self.parse_apps_script_response(raw, content_type, action)

    def parse_apps_script_response(self, raw, content_type, action):
        text = (raw or "").strip()
        if not text:
            raise ValueError(f"Apps Script devolvio respuesta vacia para action={action}")
        try:
            return json.loads(text)
        except json.JSONDecodeError as error:
            error_message = self.extract_apps_script_error(text)
            preview = " ".join(text[:1200].split())
            if error_message:
                preview = error_message + " | " + preview
            raise ValueError(
                "Apps Script no devolvio JSON para "
                f"action={action}. Content-Type={content_type or 'desconocido'}. "
                f"Inicio respuesta: {preview}"
            ) from error

    def extract_apps_script_error(self, text):
        match = re.search(
            r'<div[^>]+class=["\']errorMessage["\'][^>]*>(.*?)</div>',
            text or "",
            re.IGNORECASE | re.DOTALL,
        )
        if not match:
            return ""
        without_tags = re.sub(r"<[^>]+>", " ", match.group(1))
        return " ".join(html.unescape(without_tags).split())

    def validate_apps_script_url(self, api_url):
        parsed = urlparse(api_url)
        if parsed.scheme != "https" or parsed.netloc != "script.google.com":
            raise ValueError("La URL de Apps Script debe empezar por https://script.google.com/")
        if not parsed.path.startswith("/macros/s/") or not parsed.path.endswith("/exec"):
            raise ValueError("La URL de Apps Script debe ser la URL publica terminada en /exec")

    def write_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def generate_cex(record):
    data = record.get("data") or {}
    objects = load_cex_objects()
    update_admin(objects[1], data)
    update_general(objects[2], data)
    update_envelope(objects, data)
    update_systems(objects, data)
    return dump_cex_objects(objects)


def load_cex_objects():
    raw = BASE_CEX.read_bytes().replace(b"\r\n", b"\n")
    stream = io.BytesIO(raw)
    objects = []
    while stream.tell() < len(raw):
        objects.append(CexUnpickler(stream, encoding="latin1").load())
    return objects


def dump_cex_objects(objects):
    stream = io.BytesIO()
    for item in objects:
        pickle.dump(item, stream, protocol=0)
    return stream.getvalue().replace(b"\n", b"\r\n")


def update_admin(admin, data):
    set_list(admin, 0, value(data, "admin.localizacion.nombreEdificio"))
    set_list(admin, 1, value(data, "admin.localizacion.direccion"))
    set_list(admin, 2, title_case(value(data, "admin.localizacion.localidad")))
    set_list(admin, 3, title_case(value(data, "admin.localizacion.provincia")))
    set_list(admin, 5, value(data, "admin.cliente.nombreRazonSocial"))
    set_list(admin, 7, value(data, "admin.cliente.direccion") or value(data, "admin.localizacion.direccion"))
    set_list(admin, 8, value(data, "admin.cliente.telefono"))
    set_list(admin, 9, value(data, "admin.cliente.email"))
    set_list(admin, 11, value(data, "admin.tecnico.nombre"))
    set_list(admin, 12, value(data, "admin.tecnico.telefono"))
    set_list(admin, 13, value(data, "admin.tecnico.email"))
    set_list(admin, 14, value(data, "admin.localizacion.codigoPostal"))
    if len(admin) > 15 and isinstance(admin[15], list):
        admin[15] = [value(data, "admin.localizacion.referenciaCatastral")]
    set_list(admin, 16, upper(value(data, "admin.localizacion.localidad")))
    set_list(admin, 17, title_case(value(data, "admin.localizacion.provincia")))
    set_list(admin, 18, value(data, "admin.localizacion.codigoPostal"))


def update_general(general, data):
    set_list(general, 0, value(data, "generales.datos.normativaVigente"))
    set_list(general, 1, building_type(value(data, "generales.datos.tipoEdificio")))
    set_list(general, 2, title_case(value(data, "generales.datos.provincia") or value(data, "admin.localizacion.provincia")))
    set_list(general, 3, title_case(value(data, "generales.datos.localidad") or value(data, "admin.localizacion.localidad")))
    set_list(general, 4, value(data, "generales.datos.zonaClimaticaHE1"))
    set_list(general, 5, value(data, "generales.datos.zonaClimaticaHE4"))
    set_list(general, 6, decimal_text(value(data, "generales.definicion.superficieUtilHabitable")))
    set_list(general, 7, decimal_text(value(data, "generales.definicion.alturaLibrePlanta")))
    set_list(general, 8, decimal_text(value(data, "generales.definicion.numeroPlantasHabitables")))
    set_list(general, 9, decimal_text(value(data, "generales.definicion.demandaDiariaACS")))
    set_list(general, 10, value(data, "generales.definicion.masaParticionesInternas"))
    set_list(general, 16, decimal_text(value(data, "generales.definicion.ventilacionInmueble")))


def update_envelope(objects, data):
    cerramientos = rows(data.get("envolvente.cerramientos.items"), [
        "nombre", "tipoCerramiento", "superficie", "u", "peso", "posicion", "modoDefinicion", "patronSombras",
    ])
    huecos = rows(data.get("envolvente.huecos.items"), [
        "nombre", "cerramientoAsociado", "longitud", "altura", "multiplicador", "superficie", "uVidrio",
        "gVidrio", "uMarco", "porcMarco", "absortividadMarco", "modoDefinicion", "permeabilidad",
        "orientacion", "patronSombras",
    ])
    puentes = rows(data.get("envolvente.puentesTermicos.items"), [
        "nombre", "cerramientoAsociado", "tipoPuenteTermico", "fi", "longitud",
    ])
    objects[3][0] = [cerramiento_row(row) for row in cerramientos]
    objects[3][1] = update_hueco_objects(objects[3][1], huecos)
    objects[3][2] = [puente_row(row) for row in puentes]
    for item in walk(objects):
        attrs = getattr(item, "__dict__", None)
        if not attrs:
            continue
        if "cerramientos" in attrs:
            attrs["cerramientos"] = [cerramiento_row(row) for row in cerramientos]
        if "huecos" in attrs:
            attrs["huecos"] = update_hueco_objects(attrs.get("huecos") or [], huecos)
        if "puentesTermicos" in attrs:
            attrs["puentesTermicos"] = [puente_row(row) for row in puentes]


def update_systems(objects, data):
    contribuciones = rows(data.get("instalaciones.contribuciones.items"), [
        "nombre", "zona", "acsRenovable", "calefaccionRenovable", "refrigeracionRenovable",
        "calorRecuperadoAcs", "calorRecuperadoCalefaccion", "frioRecuperado",
        "energiaConsumidaGeneracionElectricidad", "combustible",
    ])
    if contribuciones:
        compact = [contribucion_row(contribuciones[0])]
        if len(objects[4]) > 6:
            objects[4][6] = compact
        for item in walk(objects):
            attrs = getattr(item, "__dict__", None)
            if not attrs:
                continue
            if "sistemasContribucionesMM" in attrs:
                attrs["sistemasContribucionesMM"] = compact
            if type(item).__name__ == "ContribucionesEnergeticas":
                update_contribucion_object(item, contribuciones[0])
            if type(item).__name__ == "ListadoContribucionesEnergeticas":
                update_contribucion_totals(item, contribuciones[0])
    general_updates = {
        "tipoEdificio": building_type(value(data, "generales.datos.tipoEdificio")),
        "numeroPlantas": number(value(data, "generales.definicion.numeroPlantasHabitables")),
        "Q_ACS": number(value(data, "generales.definicion.demandaDiariaACS")),
        "masaParticiones": value(data, "generales.definicion.masaParticionesInternas"),
        "tasaVentilacion": number(value(data, "generales.definicion.ventilacionInmueble")),
    }
    for item in walk(objects):
        attrs = getattr(item, "__dict__", None)
        if attrs:
            for key, val in general_updates.items():
                if key in attrs and has(val):
                    attrs[key] = val


def update_hueco_objects(existing, source_rows):
    if not source_rows:
        return existing
    result = list(existing or [])
    while len(result) < len(source_rows) and result:
        result.append(clone_pickle_object(result[-1]))
    result = result[:len(source_rows)]
    for obj, row in zip(result, source_rows):
        attrs = getattr(obj, "__dict__", {})
        attrs.update({
            "descripcion": text(row.get("nombre")),
            "cerramientoAsociado": text(row.get("cerramientoAsociado")),
            "longitud": decimal_text(row.get("longitud")),
            "altura": decimal_text(row.get("altura")),
            "multiplicador": decimal_text(row.get("multiplicador")),
            "superficie": decimal_text(row.get("superficie")),
            "Uvidrio": number(row.get("uVidrio")),
            "Gvidrio": number(row.get("gVidrio")),
            "Umarco": number(row.get("uMarco")),
            "porcMarco": decimal_text(row.get("porcMarco")),
            "absortividadValor": decimal_text(row.get("absortividadMarco")),
            "permeabilidadValor": decimal_text(row.get("permeabilidad")),
            "orientacion": text(row.get("orientacion")),
            "correctorSolar": text(row.get("orientacion")),
            "patronSombras": text(row.get("patronSombras") or "Sin patrón"),
        })
    return result


def update_contribucion_object(obj, row):
    attrs = obj.__dict__
    attrs["nombre"] = text(row.get("nombre"))
    attrs["porcACS"] = number(row.get("acsRenovable"))
    attrs["porcCal"] = number(row.get("calefaccionRenovable"))
    attrs["porcRef"] = number(row.get("refrigeracionRenovable"))
    attrs["calorRecupACS"] = number(row.get("calorRecuperadoAcs"))
    attrs["calorRecupCal"] = number(row.get("calorRecuperadoCalefaccion"))
    attrs["calorRecupRef"] = number(row.get("frioRecuperado"))
    attrs["electricidadGen"] = number(row.get("energiaConsumidaGeneracionElectricidad"))
    attrs["enConsum"] = number(row.get("energiaConsumidaGeneracionElectricidad"))
    attrs["combustible"] = text(row.get("combustible"))


def update_contribucion_totals(obj, row):
    attrs = obj.__dict__
    attrs["porcACSTotal"] = number(row.get("acsRenovable"))
    attrs["porcCalTotal"] = number(row.get("calefaccionRenovable"))
    attrs["porcRefTotal"] = number(row.get("refrigeracionRenovable"))
    attrs["calorRecupACSTotal"] = number(row.get("calorRecuperadoAcs"))
    attrs["calorRecupCalTotal"] = number(row.get("calorRecuperadoCalefaccion"))
    attrs["calorRecupRefTotal"] = number(row.get("frioRecuperado"))
    attrs["electricidadGenTotal"] = number(row.get("energiaConsumidaGeneracionElectricidad"))
    fuel = normalize(row.get("combustible"))
    for key in list(attrs):
        if key.startswith("enConsum_"):
            attrs[key] = 0.0
    fuel_key = {
        "electricidad": "enConsum_Electricidad",
        "gasnatural": "enConsum_GasNatural",
        "gasoleoc": "enConsum_Gasoil",
        "gasoil": "enConsum_Gasoil",
        "glp": "enConsum_GLP",
        "biomasa": "enConsum_BiomasaDens",
        "carbon": "enConsum_Carbon",
    }.get(fuel, "enConsum_Electricidad")
    attrs[fuel_key] = number(row.get("energiaConsumidaGeneracionElectricidad"))


def cerramiento_row(row):
    return [
        text(row.get("nombre")),
        text(row.get("tipoCerramiento")),
        decimal_text(row.get("superficie")),
        number(row.get("u")),
        number(row.get("peso")),
        text(row.get("posicion")),
        "",
        text(row.get("patronSombras") or "Sin patrón"),
        text(row.get("modoDefinicion") or "Por defecto"),
        [""],
        "",
        "",
        "1",
        "Edificio Objeto",
        "aire",
    ]


def puente_row(row):
    return [
        text(row.get("nombre")),
        "PT",
        text(row.get("tipoPuenteTermico")),
        number(row.get("fi")),
        number(row.get("longitud")),
        "defecto_fi",
        "defecto",
        text(row.get("cerramientoAsociado")),
        "Edificio Objeto",
    ]


def contribucion_row(row):
    return [
        text(row.get("nombre")),
        "renovable",
        [
            decimal_text(row.get("acsRenovable")),
            decimal_text(row.get("calefaccionRenovable")),
            decimal_text(row.get("refrigeracionRenovable")),
            False,
        ],
        [
            decimal_text(row.get("energiaConsumidaGeneracionElectricidad")),
            decimal_text(row.get("calorRecuperadoAcs")),
            decimal_text(row.get("calorRecuperadoCalefaccion")),
            decimal_text(row.get("frioRecuperado")),
            decimal_text(row.get("energiaConsumidaGeneracionElectricidad")),
            text(row.get("combustible")),
        ],
        [True, True],
        text(row.get("zona") or "Edificio Objeto"),
    ]


def rows(value, columns):
    if isinstance(value, str):
        try:
            value = json.loads(value)
        except Exception:
            value = []
    if not isinstance(value, list):
        value = []
    result = []
    for item in value:
        if isinstance(item, dict) and isinstance(item.get("values"), list):
            row = {column: item["values"][index] if index < len(item["values"]) else "" for index, column in enumerate(columns)}
        elif isinstance(item, dict):
            row = {column: item.get(column, "") for column in columns}
        else:
            continue
        if any(has(v) for v in row.values()):
            result.append(row)
    return result


def walk(root):
    stack = list(root if isinstance(root, list) else [root])
    seen = set()
    while stack:
        item = stack.pop()
        if id(item) in seen:
            continue
        seen.add(id(item))
        yield item
        if isinstance(item, dict):
            stack.extend(item.values())
        elif isinstance(item, (list, tuple)):
            stack.extend(item)
        elif hasattr(item, "__dict__"):
            stack.extend(item.__dict__.values())


def clone_pickle_object(obj):
    return pickle.loads(pickle.dumps(obj, protocol=0), encoding="latin1")


def value(data, path):
    return data.get(path, "")


def set_list(items, index, val):
    if has(val) and index < len(items):
        items[index] = text(val)


def has(val):
    return str(val or "").strip() != ""


def text(val):
    return str(val or "").replace("\r", " ").replace("\n", " ").strip()


def decimal_text(val):
    return text(val).replace(",", ".")


def number(val):
    try:
        return float(decimal_text(val) or 0)
    except Exception:
        return 0.0


def normalize(val):
    return re.sub(r"[^a-z0-9]", "", text(val).lower())


def upper(val):
    return text(val).upper()


def title_case(val):
    return text(val).lower().title()


def building_type(val):
    normalized = normalize(val)
    if "bloque" in normalized:
        return "Bloque de viviendas"
    if "viviendaindividual" in normalized:
        return "Vivienda individual"
    if "unifamiliar" in normalized:
        return "Unifamiliar"
    return text(val) or "Unifamiliar"


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), Ce3xHandler)
    print(f"CE3X server on http://{HOST}:{PORT}")
    server.serve_forever()

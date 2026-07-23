# -*- coding: ascii -*-
"""Extract CE3X's province/locality catalog into a browser-ready JS file.

Run with the 32-bit Python 2.7 bundled with OpenOffice because CE3X's
Calculos/listados.pyd is a 32-bit Python 2 extension.
"""

from __future__ import print_function

import __builtin__
import json
import os
import sys


CE3X_DIR = r"C:\Program Files (x86)\CEXv2.3"
OUTPUT = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "app",
    "ce3x-locations.js",
)


def main():
    __builtin__._ = lambda value: value
    sys.path.insert(0, CE3X_DIR)

    from Calculos.listados import Localizacion

    locations = Localizacion()
    catalog = {}
    for province_value, province_label in locations.getListadoProvincias():
        catalog[province_value] = [
            locality_value
            for locality_value, locality_label
            in locations.getLocalidadesDeProvincia(province_value)
        ]

    source = (
        "// Generated from CE3X 2.3 Calculos/listados.pyd. Do not edit manually.\n"
        "window.CE3X_LOCATION_CATALOG = %s;\n"
        % json.dumps(catalog, ensure_ascii=True, sort_keys=True, separators=(",", ":"))
    )
    with open(OUTPUT, "wb") as output:
        output.write(source)

    print("Generated %s provinces in %s" % (len(catalog), OUTPUT))


if __name__ == "__main__":
    main()

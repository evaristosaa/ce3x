FROM debian:trixie-slim

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-gunicorn wine wine64 xvfb xauth ca-certificates \
    fonts-dejavu-core fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /srv/pdf
COPY render-pdf/fetch_tools.py ./fetch_tools.py
RUN python3 fetch_tools.py
RUN useradd --create-home --uid 10001 app && chown -R app:app /srv/pdf /opt/xmlcert /opt/java
ENV WINEARCH=win64 WINEPREFIX=/home/app/.wine WINEDEBUG=-all \
    CE3X_XML2CERT=/opt/xmlcert/xml2cert.exe CE3X_WINE=/usr/bin/wine \
    CE3X_WINDOWS_JAVA=/opt/java/bin/java.exe \
    WINEPATH="Z:\\opt\\java\\bin" \
    JAVA_TOOL_OPTIONS="-Xmx128m -XX:+UseSerialGC -XX:ActiveProcessorCount=1" \
    PYTHONUNBUFFERED=1

COPY app/report_service.py ./report_service.py
COPY render-pdf/cloud_app.py render-pdf/smoke.py ./
COPY render-pdf/index.html ./index.html
COPY render-pdf/start.sh ./start.sh
RUN chmod +x start.sh
USER app
# Fail the build if the official sample cannot produce a PDF with Wine/Java.
RUN xvfb-run -a sh -c 'wineboot -u >/dev/null 2>&1 && python3 smoke.py'
EXPOSE 10000
CMD ["./start.sh"]

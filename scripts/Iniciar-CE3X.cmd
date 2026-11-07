@echo off
cd /d "%~dp0"
python "%~dp0collect-ce3x-xml.py" --watch "%CD%" --auto-rate

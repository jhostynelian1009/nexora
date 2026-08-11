# Ref: B-001, RNF-009
Set-Location "$PSScriptRoot\..\backend"
.\.venv\Scripts\uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

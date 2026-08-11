# Ref: B-001, RNF-009
# Setup Script for Nexora MVP (PowerShell)

Write-Host "=== Setting up Nexora Backend ===" -ForegroundColor Cyan
Set-Location "$PSScriptRoot\..\backend"
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt

Write-Host "=== Seeding Database ===" -ForegroundColor Cyan
.\.venv\Scripts\python -m app.db.seeder

Write-Host "=== Setting up Nexora Frontend ===" -ForegroundColor Cyan
Set-Location "$PSScriptRoot\..\frontend"
npm install

Write-Host "=== Setup completed successfully! ===" -ForegroundColor Green

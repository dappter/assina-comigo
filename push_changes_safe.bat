@echo off
setlocal enabledelayedexpansion

echo [SEGURANCA] Verificando arquivos sensiveis...

:: Verifica se existe algum .env no staging
git status --porcelain | findstr /i ".env" > nul
if %errorlevel% equ 0 (
    echo [ERRO] Arquivo .env detectado no staging! Abortando por seguranca.
    echo Remova o arquivo do commit com: git reset HEAD .env
    exit /b 1
)

:: Verifica se existe algum .sql no staging (opcional, dependendo do seu fluxo)
git status --porcelain | findstr /i "create_admin.sql" > nul
if %errorlevel% equ 0 (
    echo [ERRO] create_admin.sql detectado no staging! Abortando por seguranca.
    exit /b 1
)

echo [OK] Nenhum arquivo sensivel detectado no staging.

set /p commit_msg="Digite a mensagem do commit: "

if "%commit_msg%"=="" (
    set commit_msg="fix: atualizacoes gerais de seguranca e dashboard"
)

echo [GIT] Adicionando arquivos...
git add .

echo [GIT] Comitando: %commit_msg%
git commit -m "%commit_msg%"

echo [GIT] Enviando para o GitHub...
git push origin main

echo [SUCESSO] Projeto atualizado no GitHub!
pause

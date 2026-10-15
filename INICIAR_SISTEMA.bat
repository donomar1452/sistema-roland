@echo off
chcp 65001 >nul
title SISTEMA ROLAND / ALONSO - TALLER DE MOTOS
color 0A

echo ================================================================
echo      🏍️  SISTEMA ROLAND / ALONSO - INICIANDO ENTORNO REAL  🏍️
echo ================================================================
echo.

:: 1. Verificar Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js no está instalado en este equipo.
    echo Por favor instala Node.js (version 20 o superior) desde: https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: 2. Verificar dependencias
if not exist "node_modules\" (
    echo [1/3] Instalando dependencias del sistema...
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] Falló la instalación de dependencias.
        pause
        exit /b 1
    )
)

:: 3. Verificar compilación de producción (dist)
if not exist "dist\index.html" (
    echo [2/3] Compilando la aplicación para producción...
    call npm run build
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] Falló la compilación de producción.
        pause
        exit /b 1
    )
) else (
    echo [OK] Archivos de producción verificados.
)

:: 4. Abrir automáticamente en el navegador predeterminado
echo [3/3] Abriendo sistema en el navegador...
start http://localhost:3001

echo.
echo ================================================================
echo   SISTEMA ACTIVO Y EN EJECUCIÓN
echo ================================================================
echo   - Computadora de mostrador: http://localhost:3001
echo   - Celulares y Tablets: Revisa la IP de red mostrada abajo
echo   (Para detener el sistema, presiona Ctrl + C o cierra esta ventana)
echo ================================================================
echo.

node server/index.js
pause

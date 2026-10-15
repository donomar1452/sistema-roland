@echo off
chcp 65001 >nul
title SUBIR SISTEMA ROLAND A GITHUB Y RENDER
color 0B

echo ================================================================
echo      🚀 SUBIR SISTEMA A GITHUB PARA DESPLEGAR EN RENDER
echo ================================================================
echo.
echo Pasos previos:
echo 1. Si aún no lo has creado, entra a: https://github.com/new
echo    Crea un repositorio (ejemplo: sistema-roland).
echo.
echo 2. Copia la URL de tu repositorio (termina en .git) y pégala aquí:
echo    (Ejemplo: https://github.com/tu-usuario/sistema-roland.git)
echo.
set /p REPO_URL="Pega la URL de tu GitHub: "

if "%REPO_URL%"=="" (
    echo.
    echo [ERROR] No ingresaste ninguna URL.
    echo.
    pause
    exit /b 1
)

echo.
echo [1/3] Configurando repositorio remoto...
"C:\Users\omar\AppData\Local\Programs\MinGit\cmd\git.exe" remote remove origin 2>nul
"C:\Users\omar\AppData\Local\Programs\MinGit\cmd\git.exe" remote add origin %REPO_URL%
"C:\Users\omar\AppData\Local\Programs\MinGit\cmd\git.exe" branch -M main

echo.
echo [2/3] Verificando cambios locales...
"C:\Users\omar\AppData\Local\Programs\MinGit\cmd\git.exe" add .
"C:\Users\omar\AppData\Local\Programs\MinGit\cmd\git.exe" commit -m "Actualizacion produccion para Render" 2>nul

echo.
echo [3/3] Subiendo y reemplazando archivos en GitHub...
echo Presiona:
echo   1 = Reemplazar/Sobrescribir completamente los archivos anteriores (Recomendado)
echo   2 = Subida normal
set /p FORCE_CHOICE="Elige una opcion (1 o 2) [Default: 1]: "

if "%FORCE_CHOICE%"=="2" (
    "C:\Users\omar\AppData\Local\Programs\MinGit\cmd\git.exe" push -u origin main
) else (
    "C:\Users\omar\AppData\Local\Programs\MinGit\cmd\git.exe" push -u origin main --force
)

if %errorlevel% equ 0 (
    echo.
    echo ================================================================
    echo  ✅  ¡ARCHIVOS REEMPLAZADOS CON EXITO EN GITHUB!
    echo ================================================================
    echo Si ya tenias el servicio creado en Render:
    echo - Render detectara el cambio y comenzara a re-desplegar solo.
    echo - Puedes ir a https://dashboard.render.com y hacer clic en
    echo   "Manual Deploy" -^> "Deploy latest commit" para verlo de inmediato.
    echo.
    echo Si aun no lo conectaste en Render:
    echo 1. Abre https://dashboard.render.com
    echo 2. Clic en "New +" -^> "Web Service".
    echo 3. Selecciona tu repositorio de GitHub.
    echo ================================================================
) else (
    echo.
    echo [AVISO] Si es la primera vez, se abrira una ventana para iniciar sesion en GitHub.
    echo Si el error persiste, verifica que tengas permiso de escritura en el repositorio.
)
echo.
pause

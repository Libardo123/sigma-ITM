@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   SIGMA-ITM - Instalador y Configurador Automatico
echo ===================================================
echo.

:: 1. Verificar Python
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python no esta instalado o no se encuentra en el PATH.
    echo Por favor instala Python 3.10+ desde https://www.python.org/
    pause
    exit /b 1
)

:: 2. Verificar Node.js
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js/npm no esta instalado o no se encuentra en el PATH.
    echo Por favor instala Node.js 18+ desde https://nodejs.org/
    pause
    exit /b 1
)

:: 3. Configurar variables de entorno Backend
if not exist "backend\.env" (
    echo [INFO] Creando backend\.env a partir de backend\.env.example...
    copy "backend\.env.example" "backend\.env" >nul
) else (
    echo [OK] backend\.env ya existe.
)

:: 4. Configurar variables de entorno Frontend
if not exist "frontend\.env" (
    echo [INFO] Creando frontend\.env a partir de frontend\.env.example...
    copy "frontend\.env.example" "frontend\.env" >nul
) else (
    echo [OK] frontend\.env ya existe.
)

:: 5. Crear e inicializar entorno virtual Python
if not exist "backend\.venv" (
    echo [INFO] Creando entorno virtual Python en backend\.venv...
    python -m venv backend\.venv
)

echo [INFO] Instalando dependencias de Python...
call backend\.venv\Scripts\activate.bat
python -m pip install --upgrade pip >nul
pip install -r backend\requirements.txt

:: 6. Migraciones y datos iniciales
echo [INFO] Aplicando migraciones de base de datos...
python backend\manage.py migrate

echo [INFO] Cargando datos iniciales y usuarios de prueba...
python backend\manage.py seed_data

:: 7. Dependencias Frontend
echo [INFO] Instalando dependencias de Node.js en frontend...
cd frontend
call npm install
cd ..

echo.
echo ===================================================
echo   INSTALACION COMPLETADA EXITOSAMENTE!
echo ===================================================
echo.
echo Para iniciar los servidores ejecuta en dos terminales:
echo.
echo   Terminal 1 (Backend):
echo     cd backend
echo     .venv\Scripts\activate
echo     python manage.py runserver
echo.
echo   Terminal 2 (Frontend):
echo     cd frontend
echo     npm run dev
echo.
echo O si usas Docker simplemente ejecuta:
echo     docker compose up --build
echo.
pause

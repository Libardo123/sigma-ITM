#!/usr/bin/env bash
set -e

echo "==================================================="
echo "  SIGMA-ITM - Instalador y Configurador Automático"
echo "==================================================="
echo ""

# 1. Verificar Python 3
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] python3 no está instalado o no se encuentra en el PATH."
    exit 1
fi

# 2. Verificar Node.js y npm
if ! command -v npm &> /dev/null; then
    echo "[ERROR] npm no está instalado o no se encuentra en el PATH."
    exit 1
fi

# 3. Variables de entorno Backend
if [ ! -f "backend/.env" ]; then
    echo "[INFO] Creando backend/.env a partir de backend/.env.example..."
    cp backend/.env.example backend/.env
else
    echo "[OK] backend/.env ya existe."
fi

# 4. Variables de entorno Frontend
if [ ! -f "frontend/.env" ]; then
    echo "[INFO] Creando frontend/.env a partir de frontend/.env.example..."
    cp frontend/.env.example frontend/.env
else
    echo "[OK] frontend/.env ya existe."
fi

# 5. Crear e inicializar entorno virtual Python
if [ ! -d "backend/.venv" ]; then
    echo "[INFO] Creando entorno virtual Python en backend/.venv..."
    python3 -m venv backend/.venv
fi

echo "[INFO] Instalando dependencias de Python..."
source backend/.venv/bin/activate
pip install --upgrade pip > /dev/null
pip install -r backend/requirements.txt

# 6. Migraciones y datos iniciales
echo "[INFO] Aplicando migraciones de base de datos..."
python backend/manage.py migrate

echo "[INFO] Cargando datos iniciales y usuarios de prueba..."
python backend/manage.py seed_data

# 7. Dependencias Frontend
echo "[INFO] Instalando dependencias de Node.js en frontend..."
cd frontend
npm install
cd ..

echo ""
echo "==================================================="
echo "  ¡INSTALACIÓN COMPLETADA EXITOSAMENTE!"
echo "==================================================="
echo ""
echo "Para iniciar los servidores ejecuta en dos terminales:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd backend && source .venv/bin/activate"
echo "    python manage.py runserver"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    cd frontend && npm run dev"
echo ""
echo "O con Docker directamente:"
echo "    docker compose up --build"
echo ""

# ==============================================================
# Makefile — SIGMA ITM
# Comandos rápidos para desarrollo, pruebas y despliegue.
# Uso: make <comando>
# ==============================================================

.PHONY: help install dev test lint migrate seed superuser \
        docker-up docker-down docker-build clean

# ── Variables ──────────────────────────────────────────────────
BACKEND_DIR := backend
FRONTEND_DIR := frontend
PYTHON      := python
PIP         := pip
MANAGE      := $(PYTHON) manage.py

# ── Colores ────────────────────────────────────────────────────
BOLD  := \033[1m
RESET := \033[0m
GREEN := \033[0;32m
CYAN  := \033[0;36m

# ── Ayuda por defecto ──────────────────────────────────────────
help:
	@echo ""
	@echo "$(BOLD)$(CYAN)SIGMA ITM — Comandos disponibles$(RESET)"
	@echo "────────────────────────────────────────────────────"
	@echo "  $(BOLD)make install$(RESET)      Instala dependencias (backend + frontend)"
	@echo "  $(BOLD)make dev$(RESET)          Levanta backend y frontend en desarrollo"
	@echo "  $(BOLD)make migrate$(RESET)      Crea y aplica migraciones de la BD"
	@echo "  $(BOLD)make seed$(RESET)         Pobla la BD con datos de prueba"
	@echo "  $(BOLD)make superuser$(RESET)    Crea superusuario de Django"
	@echo "  $(BOLD)make test$(RESET)         Corre todos los tests (backend + frontend)"
	@echo "  $(BOLD)make test-backend$(RESET) Corre solo los tests del backend (pytest)"
	@echo "  $(BOLD)make test-frontend$(RESET)Corre solo los tests del frontend (vitest)"
	@echo "  $(BOLD)make lint$(RESET)         Lint del frontend (oxlint)"
	@echo "  $(BOLD)make docker-up$(RESET)    Levanta los servicios con Docker Compose"
	@echo "  $(BOLD)make docker-down$(RESET)  Detiene los contenedores"
	@echo "  $(BOLD)make docker-build$(RESET) Construye las imágenes Docker"
	@echo "  $(BOLD)make clean$(RESET)        Limpia archivos generados y caches"
	@echo ""

# ── Instalación ────────────────────────────────────────────────
install: install-backend install-frontend

install-backend:
	@echo "$(GREEN)Instalando dependencias del backend...$(RESET)"
	cd $(BACKEND_DIR) && $(PIP) install -r requirements.txt

install-frontend:
	@echo "$(GREEN)Instalando dependencias del frontend...$(RESET)"
	cd $(FRONTEND_DIR) && npm install

# ── Base de datos ──────────────────────────────────────────────
migrate:
	@echo "$(GREEN)Aplicando migraciones...$(RESET)"
	cd $(BACKEND_DIR) && $(MANAGE) migrate

makemigrations:
	@echo "$(GREEN)Generando migraciones...$(RESET)"
	cd $(BACKEND_DIR) && $(MANAGE) makemigrations

seed:
	@echo "$(GREEN)Poblando base de datos con datos de prueba...$(RESET)"
	cd $(BACKEND_DIR) && $(MANAGE) seed_data

superuser:
	cd $(BACKEND_DIR) && $(MANAGE) createsuperuser

# ── Desarrollo ─────────────────────────────────────────────────
# Nota: en Windows usa dos terminales separadas en lugar de &
dev-backend:
	@echo "$(GREEN)Iniciando servidor Django en :8000...$(RESET)"
	cd $(BACKEND_DIR) && $(MANAGE) runserver 8000

dev-frontend:
	@echo "$(GREEN)Iniciando Vite en :5173...$(RESET)"
	cd $(FRONTEND_DIR) && npm run dev

# ── Tests ──────────────────────────────────────────────────────
test: test-backend test-frontend

test-backend:
	@echo "$(GREEN)Corriendo tests del backend (pytest)...$(RESET)"
	cd $(BACKEND_DIR) && pytest -v

test-frontend:
	@echo "$(GREEN)Corriendo tests del frontend (vitest)...$(RESET)"
	cd $(FRONTEND_DIR) && npm test

# ── Calidad de código ──────────────────────────────────────────
lint:
	@echo "$(GREEN)Corriendo lint del frontend...$(RESET)"
	cd $(FRONTEND_DIR) && npm run lint

# ── Docker ─────────────────────────────────────────────────────
docker-build:
	docker compose build

docker-up:
	docker compose up -d

docker-down:
	docker compose down

# ── Limpieza ───────────────────────────────────────────────────
clean:
	@echo "$(GREEN)Limpiando archivos generados...$(RESET)"
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	cd $(FRONTEND_DIR) && rm -rf dist coverage 2>/dev/null || true
	@echo "$(GREEN)Limpieza completa.$(RESET)"

PROD = docker compose -f docker-compose.prod.yml
DEV = docker compose -f docker-compose.dev.yml

all: up

#-----	Prod (default)	-----#

up:
	$(PROD) up --build -d

down:
	$(PROD) down

re: down up

logs:
	$(PROD) logs -f

logsBackend:
	$(PROD) logs -f backend

logsFrontend:
	$(PROD) logs -f frontend

logsCaddy:
	$(PROD) logs -f caddy

ps:
	$(PROD) ps

clean: down
	$(PROD) down --rmi all --volumes

restartBackend:
	$(PROD) up -d --force-recreate backend

restartFrontend:
	$(PROD) up -d --force-recreate frontend

restartCaddy:
	$(PROD) up -d --force-recreate caddy

reloadCaddy:
	$(PROD) exec caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile

shellBackend:
	$(PROD) exec backend sh

shellFrontend:
	$(PROD) exec frontend sh

#-----	Dev	-----#

dev:
	$(DEV) up --build -V -d

devDown:
	$(DEV) down

devLogs:
	$(DEV) logs -f

devLogsBackend:
	$(DEV) logs -f backend

devLogsFrontend:
	$(DEV) logs -f frontend

devClean:
	$(DEV) down --rmi all --volumes

devShellBackend:
	$(DEV) exec backend sh

devShellFrontend:
	$(DEV) exec frontend sh

#-----	CI / Quality	-----#

format:
	npm run format --prefix frontend
	npm run format --prefix backend

formatCheck:
	npm run format:check --prefix frontend
	npm run format:check --prefix backend

lint:
	npm run lint --prefix frontend
	npm run lint --prefix backend

lintCheck:
	npm run lint:check --prefix frontend exec

build:
	npm run build --prefix frontend
	npm run build --prefix backend

test:
	npm run test --prefix backend

testVerbose:
	npm run test --prefix backend -- --verbose

check: formatCheck lintCheck build test

checkDocker:
	$(DEV) exec frontend sh -c "npm run format:check && npm run lint:check && npm run build"
	$(DEV) exec backend sh -c "npm run format:check && npm run lint:check && npm run build && npm run test"

formatDocker:
	$(DEV) exec frontend npm run format
	$(DEV) exec backend npm run format
migrate:
	cd backend && npx prisma migrate dev --name $(name)

fclean: clean devClean

.PHONY: all up down re logs logsBackend logsFrontend logsCaddy ps clean \
	restartBackend restartFrontend restartCaddy reloadCaddy \
	shellBackend shellFrontend \
	dev devDown devLogs devLogsBackend devLogsFrontend devClean \
	devShellBackend devShellFrontend \
	format formatCheck lint lintCheck build test testVerbose check migrate fclean
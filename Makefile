DEV = docker compose -f docker-compose.dev.yml
PROD = docker compose -f docker-compose.prod.yml

all: prod

dev:
	$(DEV) up --build -V -d

logsBackend:
	$(DEV) logs -f backend

logsFrontend:
	$(DEV) logs -f frontend

clean:
	$(DEV) down
	$(PROD) down

fclean: clean
	$(DEV) down --rmi all --volumes
	$(PROD) down --rmi all --volumes

re: fclean all

#-----	Prod	-----#

prod:
	$(PROD) -f docker-compose.build.yml up -d --build

prodDown:
	$(PROD) down

prodLogs:
	$(PROD) logs -f

prodRestartBackend:
	$(PROD) up -d --force-recreate backend

prodRestartFrontend:
	$(PROD) up -d --force-recreate frontend

prodRestartCaddy:
	$(PROD) up -d --force-recreate caddy

prodReloadCaddy:
	$(PROD) exec caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile

deploy:
	$(PROD) pull
	$(PROD) up -d

prodDeployBackend:
	$(PROD) pull backend
	$(PROD) up -d backend

prodDeployFrontend:
	$(PROD) pull frontend
	$(PROD) up -d frontend

#-----	Prod	-----#

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
	npm run lint:check --prefix frontend
	npm run lint:check --prefix backend

build:
	npm run build --prefix frontend
	npm run build --prefix backend

test:
	npm run test --prefix backend

testVerbose:
	npm run test --prefix backend -- --verbose

testE2e:
	npm run test:e2e --prefix backend

check: formatCheck lintCheck build test testE2e

migrate:
	cd backend && npx prisma migrate dev --name $(name)

shellBackend:
	$(DEV) exec backend sh

shellFrontend:
	$(DEV) exec frontend sh

prismaStudio:
	$(DEV) exec backend npx prisma studio --port 5555 --browser none

.PHONY: all dev prod prodDown prodLogs deploy clean fclean re \
	logsBackend logsFrontend restartBackend restartFrontend \
	prodRestartBackend prodRestartFrontend prodRestartCaddy prodReloadCaddy \
	prodDeployBackend prodDeployFrontend restart prodRestart prodLogsService \
	format formatCheck lint lintCheck build test testVerbose testE2e check \
	migrate shellBackend shellFrontend prismaStudio

DEV = docker compose -f docker-compose.dev.yml
PROD = docker compose -f docker-compose.prod.yml

all: dev

dev:
	$(DEV) up --build -V -d

prod:
	$(PROD) up --build -V -d

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

BACK = $(DEV) exec -T backend
FRONT = $(DEV) exec -T frontend

format:
	$(FRONT) npm run format
	$(BACK) npm run format

formatCheck:
	$(FRONT) npm run format:check
	$(BACK) npm run format:check

lint:
	$(FRONT) npm run lint
	$(BACK) npm run lint

lintCheck:
	$(FRONT) npm run lint:check
	$(BACK) npm run lint:check

build:
	$(FRONT) npm run build
	$(BACK) npm run build

test:
	$(BACK) npm run test

testVerbose:
	$(BACK) npm run test -- --verbose

testE2e:
	$(BACK) npm run test:e2e

migrate:
	$(BACK) npx prisma migrate dev --name $(name)

shellBackend:
	$(DEV) exec backend sh

shellFrontend:
	$(DEV) exec frontend sh

prismaStudio:
	$(DEV) exec backend npx prisma studio --port 5555 --browser none

.PHONY: all dev prod logsBackend logsFrontend clean fclean re format formatCheck lint lintCheck build test testVerbose testE2e check migrate shellBackend shellFrontend prismaStudio

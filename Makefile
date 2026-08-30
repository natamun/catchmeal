DEV = docker compose -f docker-compose.dev.yml
PROD = docker compose -f docker-compose.prod.yml

all: dev

dev:
	$(DEV) up --build

prod:
	$(PROD) up --build -d

clean:
	$(DEV) down
	$(PROD) down

fclean: clean
	$(DEV) down --rmi all --volumes
	$(PROD) down --rmi all --volumes

re: fclean all

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

.PHONY: all dev prod clean fclean re format formatCheck lint lintCheck build test testVerbose testE2e check migrate shellBackend shellFrontend prismaStudio

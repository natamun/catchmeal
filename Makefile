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

shellBackend:
	$(DEV) exec backend sh

prismaStudio:
	$(DEV) exec backend npx prisma studio --port 5555 --browser none

.PHONY: all dev prod clean fclean re format formatCheck shellBackend prismaStudio

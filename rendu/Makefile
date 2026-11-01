COMPOSE = docker compose -f docker-compose_rendu.yml

all: up

up:
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down

re: down up

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

clean: down
	$(COMPOSE) down --rmi all --volumes

.PHONY: all up down re logs ps clean

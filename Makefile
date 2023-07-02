DOCKER_COMPOSE_FILE := docker-compose.yml


.PHONY: up
up:
	docker-compose -f $(DOCKER_COMPOSE_FILE) up --build

.PHONY: down
down:
	docker-compose -f $(DOCKER_COMPOSE_FILE) down

.PHONY: ps
ps:
	docker-compose -f $(DOCKER_COMPOSE_FILE) ps -a

.PHONY: rm
rm:
	- docker volume rm $(docker volume ls -q)
	- docker network rm $(docker network ls -q)

.PHONY: front
front:
	cd frontend && npm run dev

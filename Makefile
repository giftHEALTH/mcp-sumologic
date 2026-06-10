.PHONY: install build start clean lint test docker-build docker-run docker-compose docker-down

install:
	npm install

build:
	npm run build

start:
	npm start

dev:
	npm run dev

clean:
	rm -rf dist
	rm -rf node_modules

lint:
	npm run lint

test:
	npm run test

docker-build:
	docker build -t ghcr.io/gifthealth/mcp-sumologic .

docker-run:
	docker run --rm --env-file .env -p 3006:3006 ghcr.io/gifthealth/mcp-sumologic node dist/index.js http

docker-compose:
	docker-compose up --build -d

docker-down:
	docker-compose down

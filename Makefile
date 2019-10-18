install:
	npm install

build:
	rm -rf dist
	npm run build

publish:
	npm publish --dry-run

lint:
	npx eslint .

test:
	npm test

test-debug:
	npm run test-debug

test-watch:
	npm test -- --watch

test-coverage:
	npm test -- --coverage

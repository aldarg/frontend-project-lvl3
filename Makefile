install:
	install-deps install-flow-typed
develop:
	npx webpack-dev-server
install-deps:
	npm install
build:
	rm -rf dist
	NODE_ENV=production npx webpack
deploy:
	surge ./dist --domain aldarg.surge.sh
publish:
	npm publish --dry-run
lint:
	npx eslint .
test:
	npm test
test-coverage:
	npm test -- --coverage
.PHONY: test
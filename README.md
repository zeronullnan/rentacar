## Description

This is a test repo based on Nest starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# run postgressql
$ docker-compose up -d

# run migrations
$ npx knex migrate:latest

# add some test data
npx knex seed:run

# run app
$ npm run start

```

## Swagger

Open http://localhost:3000/swagger

## License

Nest is [MIT licensed](LICENSE).

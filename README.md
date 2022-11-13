# eFuse API

## Description

A sample API for managing posts and comments, using the [Nest](https://github.com/nestjs/nest) framework.

This API is intended as an implementation of the [code sample requested by eFuse](https://github.com/eFuse-Inc/work-samples/blob/main/backend.md) during the software engineer interview process.

## Setup

### Tools

You'll need to install the following tools first:

- node v18: https://nodejs.org/en/download/)
- docker w/ docker compose: https://docs.docker.com/get-docker/

### Dependencies

Next, install the app's dependencies using `npm`:

```bash
$ npm install
```

### Config
App configuration is managed through environment variables, which are read from the `.env` file located in the root of the repo when the application boots.

This file is ignored by `git` to ensure secrets are not accidentally committed.

To get started, create your own `.env` file in the repo root, copying the values from `example.env` to use as a starting point:
```bash
$ cp .env.example .env
```

For a list of all environment variables used by the application logic, check out the `Env` interface defined here: `src/config/config.service.ts`.

The `ConfigService` class found in the same file is what's used by the application logic at runtime to access these values.  This service can be injected in any other part of the application as-needed.

### Database

This app uses [MongoDB](https://www.mongodb.com/) for storage. The app requires a working connection to a database in order to run.

If you're running the app for local development, you can start up a local running instance of mongo using `docker-compose`:

```bash
$ docker-compose up -d mongo
```

This instance will be configured to use the values from `MONGO_USER` and `MONGO_PASSWORD` in your `.env` file as the root user and password for the database, and the `MONGO_PORT` value for choosing which port to expose in docker.

You can also forego using the `docker-compose` image for the database if you'd prefer setting it up yourself.  Just modify the relevant config values in your `.env` file to point to the running instance of your choice.

### Cache

This app uses [Redis](https://redis.io/) to cache database calls. The app requires a working connection to a redis client in order to run.

If you're running the app for local development, you can start up a local running instance of redis using `docker-compose`:

```bash
$ docker-compose up -d redis
```

The port being used comes from the `REDIS_PORT` value from your `.env` file.

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

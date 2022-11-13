# eFuse API

## Description

A sample API for managing posts and comments, using the [Nest](https://github.com/nestjs/nest) framework.

This API is intended as an implementation of the [code sample requested by eFuse](https://github.com/eFuse-Inc/work-samples/blob/main/backend.md) during the software engineer interview process.

## Setup

### Tools

You'll need to install the following tools first:

- [node v18](https://nodejs.org/en/download/)

### Dependencies

Next, install the app's dependencies using `npm`:

```bash
$ npm install
```

### Config
App configuration is managed through environment variables, which are read from the `.env` file located in the root of the repo when the application boots.

This file is ignored by `git` to ensure secrets are not accidentally committed.

To get started, create your own `.env` file in the repo root, copying the values from `.env.example` to use as a starting point:
```bash
$ cp .env.example .env
```

For a list of all environment variables used by the application logic, check out the `Env` interface defined here: `src/config/config.service.ts`.

The `ConfigService` class found in the same file is what's used by the application logic at runtime to access these values.  This service can be injected in any other part of the application as-needed.

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

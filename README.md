# Combine.social

Combine.social offers an easy and simple solution to missing replies in your
home timeline or apparently empty profiles showing up in likes, boosts or
follow requests showing up in your notifications.

## Motivation

Not all relevant messages are relayed across Mastodon servers. This is a
problem.

The root cause is that servers only send messages to followers.

One side-effect of that is that if a person who you do not follow replies to a
(non-local) message, then you do not see the reply. Similarly, any previously
unknown user will show up as never having posted any messages, when they first
appear in your notifications.

This software was built as a workaround for this problem. Ideally, Mastodon
should be updated to just push all decendant messages to anyone it already
pushes original messages to. That would cause significantly less traffic than
this workaround.

As it is, we need this.

## Features

The main purpose of this software is to make your local timelines appear as if
your small instance has all the combined messages of your instance and all of
those of any other instance which has users you interact with.

Specifically, this means that:

 * Replies to messages in your home timeline are fetched for up to 24 hours.
 * Old messages are fetched for users that appear in notifications for up to 24 hours.

# Development

To get started, first install the build dependencies as described below.

## Build Dependencies

This project is built using [Turbo Repo](https://turbo.build/repo). Node and
npm versions are managed using [Volta](https://volta.sh). Images are built
using [Earthly](https://earthly.dev).

### Installation

To install Earthly run:

```
brew install earthly && earthly bootstrap
```

See installation instructions for other platforms at the Earthly
[Getting Started](https://earthly.dev/get-earthly) page.

To install Volta, run:

```
curl https://get.volta.sh | bash
```

If you are using Homebrew:

```
brew install volta
```

Turbo Repo is installed as an npm dependency, and no manual installation is
required.

To install all dependencies, run:

```
npm install
```

## Runtime Dependencies

State is managed using [PostgreSQL](https://www.postgresql.org) and
[Redis](https://redis.io), and queues are managed using
[RabbitMQ](https://www.rabbitmq.com).

Deployment can be done on any platform which has OCI image support. A 
[docker compose](https://docs.docker.com/compose/) file is included for
reference.

## Running the services

To run locally, for development purposes, individual services can be started,
e.g. to start the web frontend service, run:

```
npm run -w apps/web start
```

There are also VSCode launch definitions to start these services from with the
VS Code IDE.

To run everything, run:

```
docker compose up
```

This will start the following services:

 * Redis
 * RabbitMQ, including [management UI](http://localhost:15672)
 * PostgreSQL, listening on port 5432 for easy reference if you have a psql client avaiable.
 * [Web frontend](http://localhost:5173)
 * [API backend](http://localhost:3000/api)
 * Nginx, running as reverse proxy.

To test that everything is running smoothly, browse to [localhost:8080](http://localhost:8080).

## Building for production

**Caveat:** The build files assume that images are built and pushed to
`cyborch/toottail-<service_name>:latest`. The individual `Earthly` files can be
updated to reflect wherever you want to build and push images to.

To build the images for production use, run:

```
npm run docker:build
```

To build and push (assuming that you have access to a Docker Hub account and
are logged), run:

```
npm run docker:push
```

This will implicitly run `docker:build` if needed.

## Contributing

Combine.social is free, open-source software licensed under the [MIT license](LICENSE).

You can open issues for bugs you've found or features you think are missing.
You can also submit pull requests to this repository.

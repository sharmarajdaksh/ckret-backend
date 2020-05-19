# Dockerized Secrets Microservice

A completely functional secrets microservice meant to do a very simple task, which is to store key value pairs for users. It supports the following endpoints:
* GET /:username
* POST /:username
  * Body must have a "key" and a "value" key.
* PUT /:username/:id
  *  Body must have a "key" and a "value" key.
* DELETE /:username/:id

The microservice assumes that authentication is handled elsewhere and only does the job of maintaining secrets for users.

How to run this on your setup?
* Have Docker and Docker-Compose installed.
* `cd` into the directory
* `docker-compose up`

To stop the app
* `docker-compose down`

The microservice exposes and listens on :3002 by default. You can of course change that in the docker file and in the NodeJS code.

Uses a node:alpine image as a base for the nodejs app container, and a postgres image based second container serves as a datastore. Note that the data is volatile, i.e., it will get deleted when you stop the docker containers. If you intend to use these, do ensure that the persist the database data. Check [here](https://docs.docker.com/storage/) for instructions on how to go about doing that.
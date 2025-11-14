#!/bin/bash

docker-compose down

if [[ $1 = "-b" ]]; then
    echo "Building backend..."
    docker-compose build backend
else
    docker-compose up
fi

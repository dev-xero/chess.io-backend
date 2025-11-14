#!/bin/bash

docker-compose down

if [[ $1 = "-b" ]]; then
    echo "Building backend..."
    if !(docker-compose build backend); then
        echo "Build failed."
        exit 1
    fi
fi

if [[ $1 = "-x" || $2 = "-x" ]]; then
    docker-compose up
fi

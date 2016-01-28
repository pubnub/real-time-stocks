#!/bin/bash

# Use ". .env" command to load environment variables from .env file or export them manually

. .env
php bootstrap.php $PUBNUB_PUB_KEY $PUBNUB_SUB_KEY $PUBNUB_SECRET_KEY $PUBNUB_AUTH_KEY

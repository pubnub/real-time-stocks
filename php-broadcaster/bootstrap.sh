#!/bin/bash

. .env

php bootstrap.php $PUBNUB_PUB_KEY $PUBNUB_SUB_KEY $PUBNUB_SECRET_KEY $PUBNUB_AUTH_KEY
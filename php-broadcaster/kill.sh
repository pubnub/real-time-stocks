#!/usr/bin/env bash

ps a | grep stock.php | grep -v grep | awk "{print \$1}" | while read -r line; do
    kill -9 $line
done
#!/bin/bash
repo="git@github.com:wasserstoff-india/parchi-processor-api.git"
appname="parchi_api"
branch="nick"
while true
do
  echo "Checking for updates"
  cd /var/www/parchi_api/
  git fetch
  if [ $(git rev-list HEAD...origin/$branch --count) -gt 0 ]; then
    echo "Pulling updates"
    git pull
    pm2 restart $appname
  else
    sleep 30
  fi
done

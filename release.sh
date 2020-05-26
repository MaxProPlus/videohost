#!/bin/bash

ssh serverT 'rm -rf ~/videohost/server/src'
ssh serverT 'rm -rf ~/videohost/client/src'
scp -r server/src serverT:~/videohost/server
scp -r client/src serverT:~/videohost/client
scp changelog.txt serverT:~/videohost

ssh serverT 'cd ~/videohost/server && npm run build'
ssh serverT 'cd ~/videohost/client && npm run build'
ssh serverT 'cd ~/videohost/server && nohup npm run start > /dev/null 2>&1 &'


#!/bin/bash
WORK_PATH='/usr/projects/Diet-back'
cd $WORK_PATH
echo "先清除老代码"
git reset --hard origin/main
git clean -f
echo "拉去最新代码"
git pull origin main
echo "开始执行构建"
docker build -t Diet-back .
echo "停止旧容器并删除旧容器"
docker stop Diet-back-container
docker rm Diet-back-container
echo "启动新容器"
docker container run -p 3000:3000 --name Diet-back-container -d Diet-back
FROM node:18.16.1-alpine AS build
WORKDIR /app

# install dependancy -> node_modules
COPY --chown=node:node package*.json .
RUN chown -R node:node /app && npm ci && npm cache clean --force

# build code -> dist
# 이 때 음성파일 cp 됨
COPY --chown=node:node . .
RUN chown -R node:node /app && npm run build

FROM node:18.16.1-alpine as build
WORKDIR /app

ARG IMAGE_SAVE_PATH

# install dependancy -> node_modules
COPY --chown=node:node package*.json ./
RUN chown -R node:node /app && npm ci && npm cache clean --force

# build code -> dist
COPY --chown=node:node . .
RUN chown -R node:node /app && npm run build

# 사진 data cp
COPY --chown=node:node data/profile/* ${IMAGE_SAVE_PATH}/

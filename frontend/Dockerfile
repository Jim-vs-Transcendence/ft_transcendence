FROM node:18.16.1-alpine AS build
WORKDIR /app

ARG VITE_API_URL

# install dependancy -> node_modules
RUN mkdir svelte NestJS_Front
COPY --chown=node:node ./svelte/package*.json ./svelte
COPY --chown=node:node ./NestJS_Front/package*.json ./NestJS_Front
RUN chown -R node:node /app
RUN cd svelte && npm ci && npm cache clean --force
RUN cd NestJS_Front && npm ci && npm cache clean --force

# build code -> dist
# 이 때 음성파일 cp 됨
COPY --chown=node:node . .
RUN chown -R node:node /app/svelte && cd svelte && npm run rebuild

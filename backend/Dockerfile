FROM node:18.16.1-alpine as build
WORKDIR /usr/src/app

ENV NODE_ENV production
USER node

# install dependancy -> node_modules
COPY --chown=node:node package*.json ./
RUN npm ci --only=production && npm cache clean --force

# build code -> dist
COPY --chown=node:node . .
RUN npm run build


FROM node:18.16.1-alpine as production
WORKDIR /usr/src/app

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
# 사진 data cp
COPY --chown=node:node data/profile $IMAGE_SAVE_PATH

CMD [ "node", "dist/main.js" ]

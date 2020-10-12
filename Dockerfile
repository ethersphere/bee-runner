FROM node:lts-alpine

LABEL maintainer="Ivan Vandot <vandot@ethswarm.org>"

ENV \
    WEBHOOK_PROXY_URL= \
    APP_ID= \
    PRIVATE_KEY= \
    WEBHOOK_SECRET=

WORKDIR /app
COPY package*.json ./
RUN \
  apk add --no-cache --virtual .build-dependencies build-base gcc wget git && \
  npm ci --production && \
  apk del .build-dependencies && \
  :

COPY . .

EXPOSE 3000
CMD ["npm", "start"]

FROM node:alpine
WORKDIR /app
RUN apk update && apk upgrade && \
    apk add --no-cache bash git
COPY package.json ./
RUN yarn
COPY . .
EXPOSE 3000
CMD [ "node", "server.js" ]
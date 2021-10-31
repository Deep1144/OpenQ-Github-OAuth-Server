FROM node:lts-alpine
WORKDIR /app
RUN apk update && apk upgrade && \
    apk add --no-cache bash git
COPY package.json ./
RUN yarn
ARG port
ENV PORT=$port
ARG clientId
ENV OPENQ_ID=$clientId
ARG clientSecret
ENV OPENQ_SECRET=$clientSecret
COPY . .
EXPOSE 3001
CMD [ "yarn", "start" ]
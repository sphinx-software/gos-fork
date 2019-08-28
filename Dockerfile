FROM node:carbon

WORKDIR /app

COPY package.json /app
COPY package-lock.json /app

RUN npm install -g nodemon
RUN npm install
FROM node:18-alpine

WORKDIR /usr/src/app

RUN npm install -g nodemon
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4004

ENV NAME order

CMD ["npm", "start"]

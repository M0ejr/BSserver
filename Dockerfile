# FROM node:20.10.0

# WORKDIR /usr/src/BSserver

# COPY ./ ./

# RUN npm install

# CMD ["/bin/bash"]

FROM node:14-alpine

WORKDIR /usr/src/BSserver

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

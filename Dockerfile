FROM node:11

WORKDIR /data
COPY ./package.* .
RUN npm install
COPY ./src ./src

CMD ["npm", "run", "start"]

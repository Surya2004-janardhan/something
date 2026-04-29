FROM node:20-alpine

WORKDIR /app

COPY package.json /app/package.json
RUN npm install --omit=dev

COPY . /app

EXPOSE 5000
CMD ["npm", "start"]

FROM migrate/migrate as migrate
FROM node:16-buster as builder

COPY --from=migrate /usr/local/bin/migrate /usr/local/bin/migrate

WORKDIR /build
COPY *.json .
RUN npm install

COPY . .
RUN npm run build

CMD ["npm", "run", "start"]

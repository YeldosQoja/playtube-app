FROM node:lts-krypton AS builder
WORKDIR /app

COPY package-lock.json package.json ./
RUN npm ci --cache .npm

COPY . .
RUN npm run build

FROM node:lts-krypton AS deploy
WORKDIR /app

COPY --from=builder /app/ /app/

CMD [ "npm", "run", "start" ]
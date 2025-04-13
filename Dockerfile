FROM --platform=linux/amd64 node:alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . ./

COPY cert/cert.pem cert.pem
COPY cert/key.pem key.pem

COPY .env .env 

RUN npm run build

FROM --platform=linux/amd64 node:alpine
WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3001

CMD ["npm", "run", "start:prod"]

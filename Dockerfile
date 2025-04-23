FROM --platform=linux/amd64 node:alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . ./

COPY .env .env 

RUN npm run build

FROM --platform=linux/amd64 node:alpine
WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3001

CMD ["npm", "run", "start:prod"]

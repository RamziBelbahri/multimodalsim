#stage 1
FROM node:latest as node
WORKDIR /app
COPY package.json .
RUN npm install
COPY . ./
RUN npm run build
EXPOSE 4200
#stage 2
FROM nginx:alpine
COPY --from=node /app/dist/multimodalsim-vis /usr/share/nginx/html

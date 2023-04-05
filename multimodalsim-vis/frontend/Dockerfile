#stage 1
FROM node:latest as node
WORKDIR /frontend
COPY package.json .
RUN npm install
COPY . ./
RUN npm run build --prod
EXPOSE 4200
#stage 2
FROM nginx:alpine
COPY --from=node /frontend/dist/multimodalsim-vis /usr/share/nginx/html

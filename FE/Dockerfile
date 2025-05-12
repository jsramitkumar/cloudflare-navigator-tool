# Frontend Dockerfile (./FE/Dockerfile)
FROM node:18-alpine AS frontend-build

WORKDIR /app

COPY FE/package*.json ./
RUN npm ci

COPY FE/ .
RUN npm run build

FROM nginx:alpine AS frontend
COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY FE/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
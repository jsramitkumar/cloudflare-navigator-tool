
# Frontend Dockerfile (./FE/Dockerfile)
FROM node:18-alpine AS frontend-build

WORKDIR /app

COPY FE/package*.json ./
RUN npm ci

COPY FE/ .
RUN npm run build

FROM nginx:alpine AS frontend

# Install envsubst utility
RUN apk add --no-cache bash gettext

COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY FE/nginx.conf /etc/nginx/conf.d/default.conf.template

# Create entrypoint script that substitutes environment variables in Nginx config
RUN echo '#!/bin/bash\nenvsubst < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf\nnginx -g "daemon off;"' > /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

EXPOSE 8080
CMD ["/docker-entrypoint.sh"]

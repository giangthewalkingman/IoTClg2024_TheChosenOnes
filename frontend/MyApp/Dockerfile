FROM nginx:alpine

COPY build /usr/share/nginx/html

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to be able to access the application
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# No need to specify CMD as the base image already has the command to start Nginx

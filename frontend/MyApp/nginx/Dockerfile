# Use the official Nginx image as the base image
FROM nginx:latest

# Copy the build folder to Nginx's default HTML location
COPY ../build /usr/share/nginx/html

COPY ../default.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to be able to access the application
EXPOSE 80

# No need to specify CMD as the base image already has the command to start Nginx

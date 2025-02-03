# Stage 1: Build the React app using Node.js
FROM node:23 AS build

# Set working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project directory into the container
COPY . .

# Build the React app for production
RUN npm run build

# Stage 2: Serve the built app using a lightweight web server (nginx)
FROM nginx:alpine AS production

# Copy the built React app from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Create nginx configuration file
RUN echo $'\
server { \n\
    listen 80; \n\
    location / { \n\
        root /usr/share/nginx/html; \n\
        index index.html; \n\
        try_files $uri $uri/ /index.html; \n\
    } \n\
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
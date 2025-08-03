# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install
RUN npm install prom-client


# Copy the rest of the application code to the working directory
COPY . .

# Create a non-root user for security 
RUN addgroup -g 1001 -S nodejs 
RUN adduser -S nextjs -u 1001 

# Change ownership of the app directory to the nodejs user 
RUN chown -R nextjs:nodejs /usr/src/app

# Expose the port the app runs on
EXPOSE 4000

# Add health check 
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD curl -f http://localhost:4000/health || exit 1

# Define the command to run the application
CMD [ "npm", "start" ]




# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the application code into the container
COPY . .

# Expose the port on which your Node.js application will run
EXPOSE 5000

# Define the command to run your Node.js application
CMD ["node", "server.js"]

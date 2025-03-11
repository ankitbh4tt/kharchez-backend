# Use a stable Node.js image
FROM node:20

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Explicitly install bcrypt and rebuild
RUN npm install bcrypt --save
RUN npm rebuild bcrypt --build-from-source

# Copy the rest of the app
COPY . .

# Expose the necessary port
EXPOSE 8000

# Start the app
CMD ["npm", "start"]

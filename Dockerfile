FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies first (cache-friendly)
COPY package*.json ./
RUN npm install

# Install Prisma CLI
RUN npm install prisma @prisma/client

# Copy the rest of the app
COPY . .

# Generate Prisma client
RUN npx prisma generate

RUN npx prisma db push

EXPOSE 8000

CMD ["npm", "run", "start:dev"]

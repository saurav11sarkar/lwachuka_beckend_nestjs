#-------------------- development -----------------------
FROM node:25-alpine AS development

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

EXPOSE 5000

CMD ["npm", "run", "start:dev"]


#-------------------- build -----------------------
FROM node:25-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Prune dev dependencies for smaller size
RUN npm prune --production


#-------------------- producation -----------------------
FROM node:25-alpine AS production

WORKDIR /app

COPY package*.json /

RUN npm install --omit=dev

COPY --from=build /app/dist ./dist

COPY --from=build /app/.env ./.env

EXPOSE 5000

CMD [ "node","dist/main.js" ]
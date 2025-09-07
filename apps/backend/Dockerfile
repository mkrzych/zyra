FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm db:generate

# Build the application
RUN pnpm build

EXPOSE 3001

CMD ["pnpm", "start:prod"]
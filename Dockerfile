FROM node:20-alpine

# Install dependencies for canvas
RUN apk add --no-cache \
    build-base \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --production

# Copy app files
COPY public ./public
COPY assets ./assets
COPY views ./views
COPY dist ./dist

# Environment variables
ENV PORT=3000
ENV AUTHENTICATION=0

# Expose port
EXPOSE 3000

# Run the app
CMD [ "node", "." ]

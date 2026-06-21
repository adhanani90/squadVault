FROM node:22-alpine AS build

WORKDIR /app

# install the dependencies from both the client and the server
COPY package.json package-lock.json ./
COPY client/package.json client/package-lock.json ./client/

RUN npm install

# copy the source code here
COPY . .

RUN npm run build

# built the stage 2 image

FROM node:22-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist

# now copy the backend files and package.json
COPY package.json package-lock.json ./
COPY app.js ./
COPY db ./db
COPY middleware ./middleware
COPY routes ./routes
COPY public ./public
COPY utils ./utils
COPY controllers ./controllers

# install packages but not devDependencies
RUN npm install --omit=dev

EXPOSE 3000
CMD ["node", "app.js"]
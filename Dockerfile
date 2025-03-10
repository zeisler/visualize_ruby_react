# pull official base image
FROM node:22.9.0-alpine

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent
RUN npm install react-scripts@5.0.1 -g --silent

EXPOSE 3000

ENV NODE_ENV=production

# start app
CMD ["npm", "run", "build"]

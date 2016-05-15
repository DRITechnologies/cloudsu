from node:5.10.1

# set working dir
WORKDIR /src

# setup volume for secrets file
VOLUME /src/secure

# copy files inside container
COPY api/ /src/api
COPY dist/ /src/dist
COPY config/ /src/config
COPY middleware/ /src/middleware
COPY templates/ /src/templates
COPY utls/ /src/utls
COPY package.json /src/package.json
COPY server.js /src/server.js

# run npm install inside container
RUN npm install --production

# run command
CMD node server.js

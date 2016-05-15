from node:5.10.1

#Set working dir
WORKDIR /src

#Setup volume for secrets file
VOLUME /src/secure

#copy files
COPY api/ /src/api
COPY dist/ /src/dist
COPY config/ /src/config
COPY middleware/ /src/middleware
COPY templates/ /src/templates
COPY utls/ /src/utls
COPY package.json /src/package.json
COPY server.js /src/server.js

RUN npm install --production

CMD node server.js

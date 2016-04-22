from node:5.10.1

WORKDIR /src

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

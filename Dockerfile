FROM node:lts

WORKDIR /usr/src/app

#COPY package*.json ./

#RUN npm install

#COPY . .

EXPOSE 4000:4000

CMD [ -f ./host-token ] || (cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 8 | head -n 1 > ./host-token)
# CMD [ "node", "server.js" ]

ENTRYPOINT ([ -f ./host-token ] || (cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 8 | head -n 1 > ./host-token) );  echo "Host(broadcaster) token: "; cat ./host-token; node server.js

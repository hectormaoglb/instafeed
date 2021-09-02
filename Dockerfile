FROM node:16-alpine3.11
WORKDIR /opt/instafeed
RUN npm i pm2 -g
COPY . /opt/instafeed
EXPOSE 8443
CMD ["pm2-runtime", "--raw", "process.yml"]
FROM node:22-bookworm
WORKDIR /app
COPY package*.json ./
RUN npm install && npm install -g qrcode-terminal pm2
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

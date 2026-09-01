FROM node:24-alpine

WORKDIR /app
RUN chown node:node /app
USER node

COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma
RUN npm install

COPY --chown=node:node . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]

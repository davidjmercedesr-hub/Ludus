FROM node:20-alpine
WORKDIR /app
COPY backend/package.json ./backend/package.json
WORKDIR /app/backend
RUN npm install --omit=dev
COPY backend/src ./src
EXPOSE 3000
CMD ["npm", "start"]

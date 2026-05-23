FROM mcr.microsoft.com/playwright:v1.60.0-noble

WORKDIR /app

COPY scraper-api/package*.json ./scraper-api/
RUN npm ci --prefix scraper-api

COPY scraper-api ./scraper-api
RUN npm run build --prefix scraper-api

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["npm", "run", "start", "--prefix", "scraper-api"]

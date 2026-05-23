import { createApp } from "./server.js";
import { env } from "./utils/env.js";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Scraper API running on http://localhost:${env.PORT}`);
});

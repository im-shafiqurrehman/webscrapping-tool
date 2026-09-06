import { app } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';

async function start() {
  await connectDatabase();
  const server = app.listen(env.PORT, () =>
    console.log(`Agency OS API listening on http://localhost:${env.PORT}`),
  );
  const shutdown = () =>
    server.close(() => void disconnectDatabase().finally(() => process.exit(0)));
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start().catch((error) => {
  console.error('Unable to start API', error);
  process.exit(1);
});

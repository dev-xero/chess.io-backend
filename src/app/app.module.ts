import express from 'express';
import { config } from '../core/config';

export async function startApplication() {
  const application = express();
  const port = config.app.port;

  application.listen(port, () => {
    console.log(`App is up. running at: ${config.app.address}`);
  });
}

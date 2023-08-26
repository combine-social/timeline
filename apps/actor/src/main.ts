import express from 'express';
import type { Express, Request, Response } from 'express';
import { actor } from './routes/actor';

const app: Express = express();
const port = parseInt(process.env.PORT || '0') || 3001;

app.get('/api/v1/actor', actor);

app.listen(port, () => {
	console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

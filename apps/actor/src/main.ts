import express from 'express';
import type { Express, Request, Response } from 'express';
import { actor } from './routes/actor';
import { webfinger } from './routes/webfinger';

const app: Express = express();
const port = parseInt(process.env.PORT || '0') || 3001;

app.get('/api/v1/actor', actor);
app.get('/.well-known/webfinger', webfinger);

app.listen(port, () => {
	console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

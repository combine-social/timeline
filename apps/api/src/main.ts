import express from 'express';
import type { Express, Request, Response } from 'express';
import { initializeDB } from '$lib/db';
import { ping } from '$lib/db/db';

const app: Express = express();
const port = parseInt(process.env.PORT || '0') || 3000;

app.get('/api', (req: Request, res: Response) => {
	res.send({ result: 'ok' });
});

initializeDB();
(async () => {
	try {
		await ping();
		console.log(`⚡️[server]: DB connection up!`);
	} catch (error) {
		console.error(`✖︎ [server]: DB connection failed: ${error}`);
	}
})();

app.listen(port, () => {
	console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

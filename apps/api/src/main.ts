import express from 'express';
import type { Express, Request, Response } from 'express';
import { initializeDB, ping } from 'repository';
import { code, redirectToAuthUrl } from './routes/auth';
import { verify } from './routes/verify';

const app: Express = express();
const port = parseInt(process.env.PORT || '0') || 3000;

app.use(express.json());

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

app.post('/api/v1/auth/login', redirectToAuthUrl);
app.get('/api/v1/auth/code/:nonce', code);
app.get('/api/v1/verify', verify);

app.listen(port, () => {
	console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

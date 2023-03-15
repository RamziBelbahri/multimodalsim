import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = __dirname + "/dist/";
const app: Express = express();
const port = process.env['PORT'];
app.use(bodyParser.json());
app.use(express.static(distDir));


app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

app.get("/api/status", (req: Request, res: Response) =>  {
    res.status(200).json({ status: "UP" });
});

app.get('/api/start-simulation', (req: Request, res: Response) => {
	res.send('started simulation');
  });


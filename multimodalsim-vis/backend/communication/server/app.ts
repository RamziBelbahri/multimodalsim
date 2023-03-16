import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'node:child_process';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = __dirname + "/dist/";
const port = process.env['PORT'];
const app: Express = express();
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", 
               "http://localhost:4200");
    res.header("Access-Control-Allow-Headers", 
               "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(bodyParser.json());
app.use(express.static(distDir));

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

app.get("/api/status", (req: Request, res: Response) =>  {
    res.status(200).json({ status: "UP" });
});

app.get('/api/start-simulation', (req: Request, res: Response) => {
	const VENV_PYTHON_PATH = '../../venv/Scripts/python';
	const runSim = spawn(VENV_PYTHON_PATH, ['../fixed_line_gtfs.py']);
	
	runSim.on('spawn', () => {
		console.log('Started runSim:');
	  });

	runSim.on('error', (err) => {
		console.error('Exited runSim with error:', err.message);
	  });

	runSim.stdout.on('data', (data) => {
		console.log('Running');
		console.log(`stdout: ${data}`);
	});
	
	res.status(200).json({ status: "RUNNING" });
  });


import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = __dirname + "/dist/";
const port = process.env['PORT'] ? process.env['PORT'] : '8000';
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
let runSim:ChildProcessWithoutNullStreams|undefined;
app.get('/api/start-simulation', (req: Request, res: Response) => {
	const VENV_PYTHON_PATH = '../../venv/Scripts/python';
	runSim = spawn('bash');

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
	runSim.stderr.on('data', (err) => {
		console.log(`${err}`);
	} )
	runSim.stdin.write('cd ../..\n');
	runSim.stdin.write('source venv/bin/activate\n');
	runSim.stdin.write('cd communication\n');
	runSim.stdin.write('py -m fixed_line_gtfs\n');
	runSim.stdin.end();
	res.status(200).json({ status: "RUNNING" });
});

app.get('/api/pause', (req:Request, res:Response) => {
	if(runSim) {
		runSim.kill('SIGTSTP');
		// runSim.stdin.write(
		// 	'sudo docker pause CONTAINER_NAME\n'
		// )
		// runSim.stdin.write(
		// 	'your password\n'
		// )
		// runSim.stdin.end()
	}
})

app.get('/api/pause', (req:Request, res:Response) => {
	if(runSim) {
		runSim.kill('SIGCONT');
		// runSim.stdin.write (
		// 	'sudo docker unpause CONTAINER_NAME\n'
		// )
		// runSim.stdin.write(
		// 	'your password\n'
		// )
		// runSim.stdin.end()
	}
})
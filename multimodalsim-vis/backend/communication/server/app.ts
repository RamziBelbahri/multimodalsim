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
	const scriptCommand = `python -m communication fixed --gtfs --gtfs-folder "data/20191101/gtfs/" -r "data/20191101/requests.csv" --multimodal --log-level INFO -g "data/20191101/bus_network_graph_20191101.txt" --osrm`
	runSim = spawn(scriptCommand, [], {cwd:"../../", shell: true});

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

	res.status(200).json({ status: "RUNNING" });
});

app.get('/api/pause', (req:Request, res:Response) => {
	if(runSim) {
		runSim.kill('SIGTSTP');
	}
})

app.get('/api/continue', (req:Request, res:Response) => {
	if(runSim) {
		runSim.kill('SIGCONT');
	}
})
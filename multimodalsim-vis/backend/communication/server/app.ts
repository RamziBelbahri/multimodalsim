import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import suspend from "psuspend";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = __dirname + "/dist/";
const port = process.env['PORT'] ? process.env['PORT'] : '8000';
const app: Express = express();
let runSim:ChildProcessWithoutNullStreams|undefined;

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

const getsArgs = (req: Request):string[] => {
	const defaultFolder  = "20191101";
	const folder = req.body.folder ? req.body.folder : defaultFolder;
	const args = ["-m","communication","fixed","--gtfs","--gtfs-folder",`multimodal-simulator/data/${folder}/gtfs/`,"-r",`multimodal-simulator/data/${folder}/requests.csv`,"--multimodal","--log-level","INFO","-g",`multimodal-simulator/data/${folder}/bus_network_graph_${folder}.txt`,"--osrm"];
	return args;
};


app.get("/api/status", (req: Request, res: Response) =>  {
    res.status(200).json({ status: "UP" });
});
app.post('/api/start-simulation', (req: Request, res: Response) => {
	const args = getsArgs(req);
	runSim = spawn("python", args, {cwd:"../../"});

	runSim.on('spawn', () => {
		console.log('Started runSim:');
		// console.log(runSim);
		console.log(`Spawned child pid: ${runSim?.pid}`);
	  });

	runSim.on('error', (err) => {
		console.error('Exited runSim with error:', err.message);
	  });

	runSim.stderr.on('data', (err) => {
		console.log(`${err}`);
	} )

	res.status(200).json({ status: "RUNNING" });
});

app.get('/api/pause-simulation', (req:Request, res:Response) => {
	if(runSim) {
		suspend(runSim, true);
		console.log(runSim.killed);
	}
	res.status(200).json({ status: "PAUSED" });
})

app.get('/api/continue-simulation', (req:Request, res:Response) => {
	if(runSim) {
		suspend(runSim, false);
	}
	res.status(200).json({ status: "RESUMED" });
})

app.get('/api/end-simulation', (req:Request, res:Response) => {
	if(runSim) {
		runSim.on('close', (code, signal) => {
			console.log(
			  `child process terminated due to receipt of signal ${signal}\n`, `code: ${code}`);
		  });
		runSim.kill();
	}
	res.status(200).json({ status: "TERMINATED" });
})
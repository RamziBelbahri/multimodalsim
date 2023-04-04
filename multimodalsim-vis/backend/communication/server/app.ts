import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import suspend from "psuspend";
import { readdirSync, existsSync, mkdirSync, readFileSync, createWriteStream } from "fs";
import { rm, writeFile } from  'fs/promises';
import { ParamsDictionary } from 'express-serve-static-core';
import JSZip from 'jszip';
import multer from 'multer';


dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = __dirname + "/dist/";
const savedSimulationsDir =  __dirname + '/../saved-simulations/';
let savedSimulationsDirExists = existsSync(savedSimulationsDir);
const upload = multer({
	storage: multer.memoryStorage(),
  	limits: { files: 1 },
});
const port = process.env['PORT'] || '8000';
const app: Express = express();
let runSim:ChildProcessWithoutNullStreams|undefined;

let stats:{'Total number of trips': '0', 'Number of active trips': '0', 'Distance travelled': '0.0', 'Greenhouse gas emissions': '0.0'};

app.use((req: any, res: { header: (arg0: string, arg1: string) => void; }, next: () => void) => {
    res.header("Access-Control-Allow-Origin", 
               "http://localhost:4200");
    res.header("Access-Control-Allow-Headers", 
               "Origin, X-Requested-With, Content-Type, Accept");
	res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    next();
});
app.use(bodyParser.json({limit: '100mb'}));
app.use(express.static(distDir));

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

const getsArgs = (req: Request):string[] => {
	const defaultFolder  = "20191101";
	const folder = req.body.folder ? req.body.folder : defaultFolder;
	const args = ["-m","communication","fixed","--gtfs","--gtfs-folder",`data/${folder}/gtfs/`,"-r",`data/${folder}/requests.csv`,"--multimodal","--log-level","INFO","-g",`data/${folder}/bus_network_graph_${folder}.txt`,"--osrm"];
	return args;
};

interface myObjet {
	field: string,
	value: string
}
const updateStats = (output: string) => {
	const outputString:string = output.toString();
		if(outputString.includes("Total")) {
			const jsonStart = outputString.indexOf("{");
			const jsonEnd = outputString.indexOf("}")+1;
			const jsonString = outputString.slice(jsonStart, jsonEnd);
			const clean = jsonString.replaceAll('\'','"');
			const json = JSON.parse(clean);
			stats = json;
		}
};

app.get("/api/status", (req: Request, res: Response) =>  {
    res.status(200).json({ status: "UP" });
});
app.post('/api/start-simulation', (req: Request, res: Response) => {
	const args = getsArgs(req);
	runSim = spawn("python", args, {cwd:"../../"});

	runSim.on('spawn', () => {
		console.log('Started runSim:');
		console.log(`Spawned child pid: ${runSim?.pid}`);
	  });

	runSim.on('error', (err: { message: any; }) => {
		console.error('Exited runSim with error:', err.message);
	  });

	runSim.stderr.on('data', (output: any) => {
		updateStats(output);
		console.log(`${output}`);
	} )

	res.status(200).json({ status: "RUNNING" });
});

app.get('/api/pause-simulation', (req:Request, res:Response) => {
	if(runSim) {
		suspend(runSim, true);
	}
	res.status(200).json({ status: "PAUSED" });
})

app.get('/api/continue-simulation', (req:Request, res:Response) => {
	if(runSim) {
		suspend(runSim, false);
	}
	res.status(200).json({ status: "RESUMED" });
})

// création du dossier des simulations sauvegardées
function createSavedSimulationsDir(): void {
	if ( !savedSimulationsDirExists ){
		mkdirSync(savedSimulationsDir);
		savedSimulationsDirExists = true;
	}
}

app.get('/api/get-simulation-content', async (req:Request<ParamsDictionary, ArrayBuffer, {}, {filename: string}>, res:Response) => {
	createSavedSimulationsDir();
	const fullPath = savedSimulationsDir + req.query.filename;
	if (req.query.filename && existsSync(fullPath)) {
		const buffer: Buffer = readFileSync(fullPath);
		res.type('arraybuffer');
		return res.send(buffer);
	}
	return res.status(500).send(Buffer.from([]));
})

app.get('/api/list-saved-simulations', (req:Request, res:Response) => {
	createSavedSimulationsDir();
	let zipfiles: string[] = readdirSync(savedSimulationsDir);
	zipfiles = zipfiles.filter(file => path.extname(file) === '.zip');
	res.send(zipfiles.sort());
})

app.post('/api/save-simulation', upload.single('zipContent'), async (req:Request, res:Response) => {
	const data: Buffer = req.file?.buffer as Buffer;
	const { zipFileName }: {zipFileName: string} = req.body;
	createSavedSimulationsDir();
	try {
		await writeFile(savedSimulationsDir + zipFileName, data);
		console.log('sauvegarde de ' + zipFileName + ' réussie');
	}
	catch (e) {
		console.log('echec de sauvegarde: ', e);
		return res.status(500).json({ status: 'Sauvegarde échouée' });
	}
	return res.status(201).json({ status: 'sauvegarde de ' + zipFileName + ' réussie' });
});

app.delete('/api/delete-simulation', async (req:Request<ParamsDictionary, ArrayBuffer, {}, {filename: string}>, res:Response) => {
	const { filename } = req.query as {filename: string};
	const fullPath = savedSimulationsDir + filename;

	if (filename && existsSync(fullPath)) {
		console.log("Deletion")
		try {
			await rm(fullPath);
		}
		catch (e) {
			console.log(`La suppression du fichier ${filename} n'a pas réussi`);
			return res.status(500).send({ status: `La suppression du fichier ${filename} n'a pas réussi` });
		}

		return res.sendStatus(204);
	}

	return res.status(500).send({ status: `Le fichier ${filename} n'existe pas` });
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

app.get('/api/get-stats', (req: Request, res: Response) => {
    res.status(200).json({ status: "COMPLETED", values: stats});
})

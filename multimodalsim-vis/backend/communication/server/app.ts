import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import suspend from 'psuspend';
import { readdirSync, existsSync, mkdirSync, readFileSync, createWriteStream } from 'fs';
import { writeFile } from  'fs/promises';
import { ParamsDictionary } from 'express-serve-static-core';
import JSZip from 'jszip';
import multer from 'multer';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = __dirname + '/dist/';
const savedSimulationsDir =  __dirname + '/../saved-simulations/';
let savedSimulationsDirExists = existsSync(savedSimulationsDir);
const port = process.env['PORT'] || '8000';
const app: Express = express();
let runSim:ChildProcessWithoutNullStreams|undefined;

app.use((req: any, res: { header: (arg0: string, arg1: string) => void; }, next: () => void) => {
	res.header('Access-Control-Allow-Origin', 
		'http://localhost:4200');
	res.header('Access-Control-Allow-Headers', 
		'Origin, X-Requested-With, Content-Type, Accept');
	next();
});
app.use(bodyParser.json());
app.use(express.static(distDir));

app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});

const getsArgs = (req: Request):string[] => {
	const defaultFolder  = '20191101';
	const folder = req.body.folder ? req.body.folder : defaultFolder;
	const args = [
		'-m',
		'communication',
		'fixed',
		'--gtfs',
		'--gtfs-folder',
		`multimodal-simulator/data/${folder}/gtfs/`,
		'-r',`multimodal-simulator/data/${folder}/requests.csv`,
		'--multimodal',
		'--log-level',
		'INFO',
		'-g',
		`multimodal-simulator/data/${folder}/bus_network_graph_${folder}.txt`,
		'--osrm'
	];
	return args;
};
console.log('if you see this something went right');

app.get('/api/status', (req: Request, res: Response) =>  {
	res.status(200).json({ status: 'UP' });
});
app.post('/api/start-simulation', (req: Request, res: Response) => {
	const args = getsArgs(req);
	runSim = spawn('python', args, {cwd:'../../'});

	runSim.on('spawn', () => {
		console.log('Started runSim:');
		console.log(`Spawned child pid: ${runSim?.pid}`);
	});

	runSim.on('error', (err: { message: any; }) => {
		console.error('Exited runSim with error:', err.message);
	});

	runSim.stderr.on('data', (err: any) => {
		console.log(`${err}`);
	} );

	res.status(200).json({ status: 'RUNNING' });
});

app.get('/api/pause-simulation', (req:Request, res:Response) => {
	if(runSim) {
		suspend(runSim, true);
	}
	res.status(200).json({ status: 'PAUSED' });
});

app.get('/api/continue-simulation', (req:Request, res:Response) => {
	if(runSim) {
		suspend(runSim, false);
	}
	res.status(200).json({ status: 'RESUMED' });
});

// création du dossier des simulations sauvegardées
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createSavedSimulationsDir(dirName: string): void {
	if ( !savedSimulationsDirExists ){
		mkdirSync(savedSimulationsDir);
		savedSimulationsDirExists = true;
	}
}

app.get('/api/get-simulation-content', async (req:Request<ParamsDictionary, Blob, {}, {filename: string}>, res:Response) => {
	createSavedSimulationsDir(savedSimulationsDir);
	const filename = savedSimulationsDir + req.query.filename;
	const buffer: Buffer = readFileSync(filename);
	const zip = await new JSZip().loadAsync(buffer);
	const zipContent = await zip.generateAsync({ type: 'array' });
	res.send(zipContent);
});

app.get('/api/list-saved-simulations', (req:Request, res:Response) => {
	createSavedSimulationsDir(savedSimulationsDir);
	let zipfiles: string[] = readdirSync(savedSimulationsDir);
	zipfiles = zipfiles.filter(file => path.extname(file) === '.zip');
	res.send(zipfiles.sort());
});

app.post('/api/save-simulation', async (req:Request, res:Response) => {
	const data: {zipContent: number[], zipFileName: string} = req.body;
	createSavedSimulationsDir(savedSimulationsDir);
	try {
		await writeFile(savedSimulationsDir + data.zipFileName, Buffer.from(data.zipContent));
		console.log('sauvegarde de ' + data.zipFileName + ' réussie');
	}
	catch (e) {
		console.log('echec de sauvegarde: ', e);
		return res.status(500).json({ status: 'Sauvegarde échouée' });
	}
	return res.status(201).json({ status: 'sauvegarde de ' + data.zipFileName + ' réussie' });
});
app.get('/api/end-simulation', (req:Request, res:Response) => {
	if(runSim) {
		runSim.on('close', (code, signal) => {
			console.log(
				`child process terminated due to receipt of signal ${signal}\n`, `code: ${code}`);
		});
		runSim.kill();
	}
	res.status(200).json({ status: 'TERMINATED' });
});

const upload = multer({ dest: '../../tmp' });


app.post('/api/upload-file', upload.any(), (req:Request, res:Response) => {
	const files = req.files;
	if(!files) {
		res.status(500).json({status: 'no file received'});
		return;
	}
	const file = (files as Array<any>)[0];
	if(!file) {
		res.status(500).json({status: 'received file is undefined'});
		return;
	}
	fs.readFile(file.path, (err, data) => {
		if (err) {
			res.status(500).send('Error reading file');
		}

		const filePath = decodeURIComponent(file.fieldname);
		const directories = filePath.split('/');
		let directory = '../../simulations/';

		for(let i = 0; i < directories.length - 1; i ++) {
			directory += (directories[i] + '/');
			if(!fs.existsSync(directory)) {
				fs.mkdirSync(directory);
			}
		}
		fs.writeFile('../../simulations/' + filePath, data, (err) => {
			if (err) {
			  console.error(err);
			  return;
			}
		});

		// Do something with the file contents
		// Send response to client
		// res.send('File uploaded successfully');
	});
	res.status(200).json({ status: 'got file'});
	console.log(file);
	// if(filePath){
	// 	fs.readFile(filePath, (err, data) => {
	// 		if (err) {
	// 			console.error(err.cause);
	// 			res.status(500).send('Error reading file');
	// 		}

	// 		// File contents are stored in the `data` buffer
	// 		// console.log(data.toString());

	// 		// Do something with the file contents
	// 		// Send response to client
	// 		res.send('File uploaded successfully');
	// 	});
	}

});
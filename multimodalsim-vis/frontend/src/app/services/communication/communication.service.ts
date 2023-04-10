import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
// import { StopPositionHandlerService } from '../cesium/stop-position-handler.service';
// import { SimulationParserService } from '../data-initialization/simulation-parser/simulation-parser.service';
// import { StopLookupService } from '../util/stop-lookup.service';
// import { CesiumClass } from 'src/app/shared/cesium-class';

@Injectable({
	providedIn: 'root',
})
export class CommunicationService {
	// public simulationToFetch:string|undefined;
	private readonly APIURL = 'http://127.0.0.1:8000/api/';
	constructor(
		private http: HttpClient,
	) {}
	getStatus() {
		return this.http.get(this.APIURL + 'status').pipe(catchError(this.handleError));
	}

	startSimulation(args: object) {
		return this.http.post(this.APIURL + 'start-simulation', args).pipe(catchError(this.handleError));
	}

	uploadFilesAndLaunch(args:object) {
		return this.http.post(this.APIURL + 'upload-file-and-launch', args).subscribe({
			next: _ => {
				(document.getElementById('server-response') as HTMLParagraphElement).innerText = 'Started server side simulation';
			},
			error: err => {console.log(err);},
			complete: () => console.log(),
		});
	}

	pauseSimulation() {
		return this.http.get(this.APIURL + 'pause-simulation').pipe(catchError(this.handleError));
	}

	continueSimulation() {
		return this.http.get(this.APIURL + 'continue-simulation').pipe(catchError(this.handleError));
	}

	endSimulation() {
		return this.http.get(this.APIURL + 'end-simulation').pipe(catchError(this.handleError));
	}

	requestStopsFile(simName:string) {
		const params = new HttpParams().set('simName', simName);
		return this.http.get(this.APIURL + 'stops-file', {responseType: 'text', params});
	}

	launchExistingBackendSimulation(simName:string) {
		const body = {
			simName: simName,
		};
		return this.http.post(this.APIURL + 'launch-saved-sim',body);
	}

	restartSimulation() {
		return this.http.post(this.APIURL + 'restart', {});
	}

	private handleError(error: HttpErrorResponse) {
		console.log(error.message);
		if (error.status === 0) {
			console.error('An error occurred:', error.error);
		} else {
			console.error(`Backend returned code ${error.status}, body was: `, error.error);
		}
		console.log(error);
		return throwError(() => new Error('Something bad happened; please try again later.'));
		
	}

	sendPreloadedSimulation(formData:FormData) {
		return this.http.post(this.APIURL + 'preloaded-simulation', formData);
	}

	saveSimulation(zipData: { zipContent: Blob; zipFileName: string }) {
		const formData = new FormData();
		formData.append('zipContent', zipData.zipContent);
		formData.append('zipFileName', zipData.zipFileName);
		return this.http.post(this.APIURL + 'save-simulation', formData).pipe(catchError(this.handleError));
	}

	listSimulations() {
		return this.http.get(this.APIURL + 'list-saved-simulations').pipe(catchError(this.handleError));
	}

	getSimulationContent(filename: string) {
		return this.http.get(this.APIURL + `get-simulation-content/?filename=${filename}`, {responseType: 'arraybuffer'}).pipe(catchError(this.handleError));
	}

	deleteSavedSimulation(filename: string) {
		return this.http.delete(this.APIURL + `delete-simulation/?filename=${filename}`).pipe(catchError(this.handleError));
	}


}

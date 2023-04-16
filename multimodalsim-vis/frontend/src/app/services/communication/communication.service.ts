import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { enableButton } from '../util/toggle-button';
import * as currentSimulation from 'src/app/helpers/session-storage';

@Injectable({
	providedIn: 'root',
})
export class CommunicationService {
	private readonly APIURL = 'http://127.0.0.1:8000/api/';
	constructor(private http: HttpClient) {}
	getStatus() {
		return this.http.get(this.APIURL + 'status').pipe(catchError(this.handleError));
	}

	startSimulation(args: object) {
		return this.http.post(this.APIURL + 'start-simulation', args).pipe(catchError(this.handleError));
	}

	uploadFilesAndLaunch(args: object) {
		return this.http.post(this.APIURL + 'upload-file-and-launch', args).subscribe({
			next: (_) => {
				// (document.getElementById('server-response') as HTMLParagraphElement).innerText = 'Started server side simulation';
			},
			error: (err) => {
				console.log(err);
			},
			complete: () => {
				enableButton('restart-sim-menu-button');
			},
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

	requestStopsFile(simName: string) {
		const params = new HttpParams().set('simName', simName);
		return this.http.get(this.APIURL + 'stops-file', { responseType: 'text', params });
	}

	stopCurrentBackendSimulation() {
		return this.http.post(this.APIURL + 'stopsim', {});
	}

	private handleError(error: HttpErrorResponse) {
		if (error.status === 0) {
			console.error('An error occurred:', error.error);
		} else {
			console.error(`Backend returned code ${error.status}, body was: `, error.error);
		}
		return throwError(() => new Error('Something bad happened; please try again later.'));
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
		return this.http.get(this.APIURL + `get-simulation-content/?filename=${filename}`, { responseType: 'arraybuffer' }).pipe(catchError(this.handleError));
	}

	deleteSavedSimulation(filename: string) {
		return this.http.delete(this.APIURL + `delete-simulation/?filename=${filename}`).pipe(catchError(this.handleError));
	}

	restartBackendSimulation() {
		const simName = currentSimulation.getCurrentSimulationName();
		const body = {
			simName: simName,
		};
		return this.http.post(this.APIURL + 'restart-livesim', body);
	}

	getPreloadedFiles() {
		const simName = currentSimulation.getCurrentSimulationName();
		const params = new HttpParams();
		params.append('simName', simName ? simName : '');
		return this.http.get(this.APIURL + `get-preloaded-tmp-files/simName=${simName}`);
	}
}

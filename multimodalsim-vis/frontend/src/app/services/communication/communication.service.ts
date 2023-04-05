import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StopPositionHandlerService } from '../cesium/stop-position-handler.service';
import { SimulationParserService } from '../data-initialization/simulation-parser/simulation-parser.service';
import { StopLookupService } from '../util/stop-lookup.service';
import { CesiumClass } from 'src/app/shared/cesium-class';

@Injectable({
	providedIn: 'root',
})
export class CommunicationService {
	public simulationToFetch:string|undefined;
	private readonly APIURL = 'http://127.0.0.1:8000/api/';
	constructor(
		private http: HttpClient,
		private stopLookup: StopLookupService,
		private stopPositionHandlerService:StopPositionHandlerService,
		private simulationParserService:SimulationParserService
	) {}
	getStatus() {
		return this.http.get(this.APIURL + 'status').pipe(catchError(this.handleError));
	}

	startSimulation(args: object) {
		return this.http.post(this.APIURL + 'start-simulation', args).pipe(catchError(this.handleError));
	}

	uploadFile(args:object) {
		return this.http.post(this.APIURL + 'upload-file-realtime', args).subscribe({
			next: data => {console.log(data);},
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

	getStopsFile(simName:string) {
		const params = new HttpParams().set('simName', simName);
		console.log(params);
		return this.http.get(this.APIURL + 'stops-file', {responseType: 'text', params}).subscribe({
			next: data => {
				const stops = this.simulationParserService.parseFile(data).data;
				for (const line of stops) {
					this.stopLookup.coordinatesIdMapping.set(Number(line['stop_id']), CesiumClass.cartesianDegrees(line['stop_lon'], line['stop_lat']));
				}
				this.stopPositionHandlerService.initStops();
			},
			error: error => {
				console.error('Error:', error);
			},
			complete: () => {
				console.log('Request completed');
			}
		});
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

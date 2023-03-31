import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
	providedIn: 'root',
})
export class CommunicationService {
	private readonly APIURL = 'http://localhost:8000/api/';
	constructor(private http: HttpClient) {}

	getStatus() {
		return this.http.get(this.APIURL + 'status').pipe(catchError(this.handleError));
	}
	startSimulation() {
		return this.http.get(this.APIURL + 'start-simulation').pipe(catchError(this.handleError));
	}

	pauseSimulation() {
		return this.http.get(this.APIURL + 'pause-simulation').pipe(catchError(this.handleError));
	}

	continueSimulation() {
		return this.http.get(this.APIURL + 'continue-simulation').pipe(catchError(this.handleError));
	}

	private handleError(error: HttpErrorResponse) {
		if (error.status === 0) {
			console.error('An error occurred:', error.error);
		} else {
			console.error(`Backend returned code ${error.status}, body was: `, error.error);
		}
		return throwError(() => new Error('Something bad happened; please try again later.'));
	}
	
	saveSimulation(zipData: {zipContent: Blob, zipFileName: string}) {
		console.log('comm service');
		return this.http.post(this.APIURL + 'save-simulation', zipData).pipe(catchError(this.handleError));
	}

	listSimulations() {
		return this.http.get(this.APIURL + 'list-saved-simulations').pipe(catchError(this.handleError));
	}

	getSimulationContent(filename: string){
		return this.http.get(this.APIURL + `get-simulation-content/?filename=${filename}`).pipe(catchError(this.handleError));
	}
}

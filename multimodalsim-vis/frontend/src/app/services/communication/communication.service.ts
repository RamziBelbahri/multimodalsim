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

	startSimulation(args: object) {
		return this.http.post(this.APIURL + 'start-simulation', args).pipe(catchError(this.handleError));
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

	private handleError(error: HttpErrorResponse) {
		console.log(error.message);
		if (error.status === 0) {
			console.error('An error occurred:', error.error);
		} else {
			console.error(`Backend returned code ${error.status}, body was: `, error.error);
		}
		return throwError(() => new Error('Something bad happened; please try again later.'));
	}

	saveSimulation(zipData: { zipContent: Blob; zipFileName: string }) {
		console.log(zipData);
		const formData = new FormData();
		formData.append('zipContent', zipData.zipContent);
		formData.append('zipFileName', zipData.zipFileName);
		console.log(formData);
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

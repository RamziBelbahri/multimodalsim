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
		if (error.status === 0) {
			console.error('An error occurred:', error.error);
		} else {
			console.error(`Backend returned code ${error.status}, body was: `, error.error);
		}
		return throwError(() => new Error('Something bad happened; please try again later.'));
	}
}

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
	providedIn: 'root',
})
export class CommunicationService {
	private readonly apiUrl = 'http://localhost:8000/api/';
	constructor(private http: HttpClient) {}

	getStatus() {
		return this.http.get(this.apiUrl + 'status').pipe(catchError(this.handleError));
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

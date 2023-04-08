import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class MenuNotifierService {
	private notifSource = new ReplaySubject<string>();

	state = this.notifSource.asObservable();

	notify(name: string) {
		this.notifSource.next(name);
	}
}

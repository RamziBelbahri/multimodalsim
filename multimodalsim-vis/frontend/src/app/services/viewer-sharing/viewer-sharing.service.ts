import { Injectable } from '@angular/core';
import { Viewer } from 'cesium';
import { ReplaySubject } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class ViewerSharingService {
	private viewerSource = new ReplaySubject<Viewer>();

	currentViewer = this.viewerSource.asObservable();

	setViewer(viewer: Viewer) {
		this.viewerSource.next(viewer);
	}
}

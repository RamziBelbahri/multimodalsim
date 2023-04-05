import { Injectable } from '@angular/core';
import { Viewer } from 'cesium';
import { ReplaySubject } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class ViewerSharingService {
	private viewerSource = new ReplaySubject<Viewer>();

	currentViewer = this.viewerSource.asObservable();
	public viewer:Viewer|undefined;
	setViewer(viewer: Viewer) {
		this.viewer = viewer;
		this.viewerSource.next(viewer);
	}
}

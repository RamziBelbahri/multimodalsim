import { Injectable } from '@angular/core';
import { Viewer } from 'cesium';
import { BehaviorSubject } from 'rxjs';
import { CesiumClass } from 'src/app/shared/cesium-class';

@Injectable({
	providedIn: 'root',
})
export class ViewerSharingService {
	private viewerSource = new BehaviorSubject<Viewer>(CesiumClass.viewer(''));

	currentViewer = this.viewerSource.asObservable();

	setViewer(viewer: Viewer) {
		this.viewerSource.next(viewer);
	}
}

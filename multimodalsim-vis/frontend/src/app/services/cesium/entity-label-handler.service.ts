/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Cartesian2, Viewer } from 'cesium';
import { ReplaySubject } from 'rxjs';
import { EntityInfos } from 'src/app/classes/data-classes/entity-info';
import { CesiumClass } from 'src/app/shared/cesium-class';
import { StopPositionHandlerService } from './stop-position-handler.service';
import { VehiclePositionHandlerService } from './vehicle-position-handler.service';

@Injectable({
	providedIn: 'root',
})
export class EntityLabelHandlerService {
	private currentMousePosition: Cartesian2 | undefined;
	private lastEntities = new Array<any>();
	private displayedEntityInfosSource = new ReplaySubject<EntityInfos>();

	displayedEntityInfos: EntityInfos | undefined;
	currentEntityInfos = this.displayedEntityInfosSource.asObservable();

	constructor(private stopHandler: StopPositionHandlerService, private vehicleHandler: VehiclePositionHandlerService) {
		this.lastEntities = new Array<any>();
	}

	initHandler(viewer: Viewer) {
		viewer.scene.preRender.addEventListener(() => {
			// event.preventDefault();
			let displayedEntity: any;
			if (this.currentMousePosition) {
				const pickedObject = viewer.scene.pick(this.currentMousePosition);

				if (pickedObject) {
					displayedEntity = pickedObject.id;

					if (displayedEntity.position) {
						this.displayedEntityInfos = this.getClickedEntityInfos(displayedEntity);
						this.setEntityInfos();
					}
				}
			}
		});

		const mouseHandler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

		// Modifie la position de souris pour pouvoir pick une entité
		mouseHandler.setInputAction((movement: any) => {
			this.currentMousePosition = movement.position;
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	}

	// Obtenir le nombre de passagers dans un véhicule
	private getClickedEntityInfos(displayedEntity: any): EntityInfos {
		const entity: any | undefined = displayedEntity;
		let position = CesiumClass.cartesian3(0, 0, 0);
		let passengers: Array<string> | undefined = [];

		if (entity.name == 'stop') {
			position = CesiumClass.cartesian3(entity.position['_value'].x, entity.position['_value'].y, entity.position['_value'].z);
			passengers = this.stopHandler.getStopIdMapping().get(entity.id)?.getPassengers();
		} else if (entity.name == 'vehicle') {
			position = CesiumClass.cartesian3(
				entity.position['_property']['_interpolationResult'][0],
				entity.position['_property']['_interpolationResult'][1],
				entity.position['_property']['_interpolationResult'][2]
			);
			passengers = this.vehicleHandler.getVehicleIdMapping().get(entity.id)?.getOnBoardPassengers();
		}

		return new EntityInfos(passengers ? passengers : [], position, entity.name, entity.id);
	}

	private setEntityInfos(): void {
		this.displayedEntityInfosSource.next(this.displayedEntityInfos as EntityInfos);
	}
}

import { Component, ElementRef, OnInit } from '@angular/core';
import { Viewer } from 'cesium';
import { CameraHandlerService } from 'src/app/services/cesium/camera-handler.service';
import { PassengerHandlerService } from 'src/app/services/cesium/passenger-handler.service';
import { EntityDataHandlerService } from 'src/app/services/entity-data-handler/entity-data-handler.service';
import { SimulationParserService } from 'src/app/services/data-initialization/simulation-parser/simulation-parser.service';

import { CesiumClass } from 'src/app/shared/cesium-class';
@Component({
	selector: 'app-cesium-container',
	templateUrl: './cesium-container.component.html',
	styleUrls: ['./cesium-container.component.css'],
})
export class CesiumContainerComponent implements OnInit {
	private viewer: Viewer = CesiumClass.viewer(this.element.nativeElement);
	private readonly DEMO_EVENTS_AMOUNT: number = 15000;
	public static cesiumContainer: CesiumContainerComponent;

	constructor(
		private element: ElementRef,
		private cameraHandler: CameraHandlerService,
		private simulationParserService: SimulationParserService,
		private entityDataHandlerService: EntityDataHandlerService,
		private passengerHandler: PassengerHandlerService
	) {
		CesiumContainerComponent.cesiumContainer = this;
	}

	ngOnInit() {
		this.viewer.imageryLayers.addImageryProvider(
			//assetId 4 est la carte 2D et 1 est la carte 3D par défaut
			CesiumClass.imagery({ assetId: 4 })
		);
		this.cameraHandler.initCameraData(this.viewer.camera);
	}

	launch(): void {
		this.entityDataHandlerService.runVehiculeSimulation(this.viewer, this.DEMO_EVENTS_AMOUNT);
	}
}

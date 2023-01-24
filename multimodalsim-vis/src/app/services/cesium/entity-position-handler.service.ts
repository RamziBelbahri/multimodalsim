import { Injectable } from '@angular/core';
import { Entity } from 'cesium';

@Injectable({
	providedIn: 'root',
})
export class EntityPositionHandlerService {
	computeMovementTicks(/*entity: Entity, endPos: Array<number>, endTime: JulianDate*/) {
		// Prendre la position finale désirée et trouver le nombre de tick de setEntityToNewPos qu'il faut faire pour séparer l'exécution sur le temps.
		// TODO: trouver un moyen d'exécuter plusieurs fois setEntityToNewPos sans bloquer la performance
	}

	setEntityToNewPos(entity: Entity, newPos: Array<number>): void {
		entity.polygon?.hierarchy?.getValue(Cesium.JulianDate.now(), newPos);
	}
}

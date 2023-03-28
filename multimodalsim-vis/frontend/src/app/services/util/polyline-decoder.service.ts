import { Injectable } from '@angular/core';
import { Cartesian3 } from 'cesium';
import * as polylineEncoder from '@mapbox/polyline';
import { TimedPolyline } from 'src/app/classes/data-classes/polyline-section';

@Injectable({
	providedIn: 'root',
})
export class PolylineDecoderService {
	// Prend la string complète de la polyline et retourne une liste de positions
	parsePolyline(rawString: string): TimedPolyline {
		// console.log(rawString)
		const polylines = new Array<string>();
		const times = new Array<Array<number>>();
		const rawStringArray = rawString.split('\'');

		for (let i = 0; i < rawStringArray.length; i++) {
			if ((i - 3) % 4 == 0) {
				// console.log("rawStringArray[i]", rawStringArray[i]);
				// console.log('----------------------------------------------------------------------------')
				polylines.push(rawStringArray[i]);
			} else if ((i - 4) % 4 == 0 && i != 0) {
				const timesString = rawStringArray[i].substring(3, rawStringArray[i].length - 4);
				// console.log("timestring", timesString);
				// console.log('============================================================================')
				times.push(
					timesString.split(',').map((item) => {
						return Number(item);
					})
				);
			}
		}

		const polyline = new TimedPolyline();
		polyline.positions = this.decodePolyline(polylines);
		polyline.sectionTimes = times;
		console.log(polyline);
		return polyline;
	}

	// Utilise un décodeur pour décrypter une polyline
	private decodePolyline(polylines: Array<string>): Array<Array<Cartesian3>> {
		const positions = new Array<Array<Cartesian3>>();

		for (let i = 0; i < polylines.length; i++) {
			const polyline = this.removeRepeatedEscapeChar(polylines[i]);

			const points = polylineEncoder.decode(polyline);
			const sectionPositions = new Array<Cartesian3>();

			for (let j = 0; j < points.length; j++) {
				sectionPositions.push(Cesium.Cartesian3.fromDegrees(points[j][1], points[j][0]));
			}

			positions.push(sectionPositions);
		}

		return positions;
	}

	// Enlève les répétitions de \ qui causent des bugs dans les polylines.
	private removeRepeatedEscapeChar(polyline: string): string {
		let result = polyline;

		if (polyline.includes('\\')) {
			result = polyline.replaceAll('\\\\', '\\');
		}

		return result;
	}
}

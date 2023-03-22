import { Injectable } from '@angular/core';
import { Cartesian3 } from 'cesium';
import * as polylineEncoder from '@mapbox/polyline';

@Injectable({
	providedIn: 'root',
})
export class PolylineDecoderService {
	// Prend la string complète de la polyline et retourne une liste de positions
	parsePolyline(rawString: string): Array<Cartesian3> {
		const polylines = new Array<string>();
		const rawStringArray = rawString.split('\'');

		for (let i = 0; i < rawStringArray.length; i++) {
			if ((i - 3) % 4 == 0) {
				polylines.push(rawStringArray[i]);
			}
		}

		return this.decodePolyline(polylines);
	}

	// Utilise un décodeur pour décrypter une polyline
	private decodePolyline(polylines: Array<string>): Array<Cartesian3> {
		const positions = new Array<Cartesian3>();

		for (let i = 0; i < polylines.length; i++) {
			const polyline = this.removeRepeatedEscapeChar(polylines[i]);
			const points = polylineEncoder.decode(polyline);

			for (let j = 0; j < points.length; j++) {
				positions.push(Cesium.Cartesian3.fromDegrees(points[j][1], points[j][0]));
			}
		}

		return positions;
	}

	// Enlève les répétitions de \ qui causent des bugs dans les polylines.
	private removeRepeatedEscapeChar(polyline: string): string {
		let result = polyline;

		if (polyline.includes('\\')) {
			result = polyline.replace('\\\\', '\\');
		}

		return result;
	}
}

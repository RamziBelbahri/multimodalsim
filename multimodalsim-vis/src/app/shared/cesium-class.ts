import { Cartesian3, IonImageryProvider, PolygonHierarchy, Viewer } from 'cesium';

export class CesiumClass {
	static viewer(element: Element): Viewer {
		return new Cesium.Viewer(element);
	}

	static polygonHierarchy(points: Cartesian3[]): PolygonHierarchy {
		return new Cesium.PolygonHierarchy(points);
	}

	static cartesian3(x: number, y: number, z: number): Cartesian3 {
		return new Cesium.Cartesian3(x, y, z);
	}

	static cartesianDegrees(x: number, y: number): Cartesian3 {
		return new Cesium.Cartesian3.fromDegrees(x, y);
	}

	static imagery(property: IonImageryProvider.ConstructorOptions): IonImageryProvider {
		return new Cesium.IonImageryProvider(property);
	}
}

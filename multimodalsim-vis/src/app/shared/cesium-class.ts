import { CallbackProperty, Cartesian3, IonImageryProvider, PolygonHierarchy, Viewer } from 'cesium';

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

	static addCartesian(left: Cartesian3, right: Cartesian3): Cartesian3 {
		const sum = new Cesium.Cartesian3();
		sum.x = right.x + left.x;
		sum.y = right.y + left.y;
		sum.z = right.z + left.z;
		return sum;
	}

	static cartesianDistance(left: Cartesian3, right: Cartesian3): Cartesian3 {
		const distance = new Cesium.Cartesian3();
		distance.x = right.x - left.x;
		distance.y = right.y - left.y;
		distance.z = right.z - left.z;
		return distance;
	}

	static cartesianScalarDiv(cartesian: Cartesian3, scalar: number): Cartesian3 {
		const result = new Cesium.Cartesian3();
		result.x = cartesian.x / scalar;
		result.y = cartesian.y / scalar;
		result.z = cartesian.z / scalar;
		return result;
	}

	static imagery(property: IonImageryProvider.ConstructorOptions): IonImageryProvider {
		return new Cesium.IonImageryProvider(property);
	}

	static callback(func: CallbackProperty.Callback, isConstant: boolean): CallbackProperty {
		return new Cesium.CallbackProperty(func, isConstant);
	}
}

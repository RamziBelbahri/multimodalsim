
import { Cartesian3, SampledPositionProperty, Viewer } from "cesium";
import * as polylineEncoder from '@mapbox/polyline';
import { VehicleEvent } from "./vehicle-class/vehicle-event";

type PositionTimePair<K,V> = [Array<Cartesian3>, Array<number>];
export class RealTimePolyline {
    // stop --> [Positions, times]
    stopsPolylineLookup = new Map<string, PositionTimePair<Array<Cartesian3>, Array<number>>>();
    stops:string[] = [];
    constructor(polylinesJSON:any) {
        for(let [stop, _] of Object.entries(polylinesJSON)) {
            const positions = polylineEncoder.decode(polylinesJSON[stop][0]);
            this.stops.push(stop);
            const cartesian3Pos = [];
            for(const position of positions) {
                cartesian3Pos.push(Cesium.Cartesian3.fromDegrees(position[0], position[1]));
            }
            if(stop) {
                this.stopsPolylineLookup.set(
                    stop, [
                        cartesian3Pos,
                        polylinesJSON[stop][1],
                    ]
                )
            }
        }
    }
    drawPolyline(viewer:Viewer) {
        
        viewer.entities.add;
    }
    // adds the polyline
    addPositionsFromPolyline(position:SampledPositionProperty, startID:string, stopID:string, event:VehicleEvent) {
        
    }
}
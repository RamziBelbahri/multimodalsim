import * as LOCAL_STORAGE_KEYS from 'src/app/helpers/local-storage-keys';

export function setIsSimulationLive(isLive:boolean) {
	window.sessionStorage.setItem(LOCAL_STORAGE_KEYS.IS_LIVESIM, isLive ? 'true' : 'false');
}

export function isCurrentSimulationLive() {
	return window.localStorage.getItem(LOCAL_STORAGE_KEYS.IS_LIVESIM) == 'true';
}

export function setCurrentSimulationName(name:string) {
	window.sessionStorage.setItem(LOCAL_STORAGE_KEYS.SIMULATION_TO_FETCH, name);
}

export function getCurrentSimulationName() {
	return window.sessionStorage.getItem(LOCAL_STORAGE_KEYS.SIMULATION_TO_FETCH);
}

export function setCurrentSim(isLive:boolean, simName:string) {
	setIsSimulationLive(isLive);
	setCurrentSimulationName(simName);
}

export function getCurrentSim():[string|null, boolean] {
	return [getCurrentSimulationName(), isCurrentSimulationLive()];
}

export function removeIsLive() {
	window.sessionStorage.removeItem(LOCAL_STORAGE_KEYS.IS_LIVESIM);
}

export function removeSimName() {
	window.sessionStorage.removeItem(LOCAL_STORAGE_KEYS.SIMULATION_TO_FETCH);
}
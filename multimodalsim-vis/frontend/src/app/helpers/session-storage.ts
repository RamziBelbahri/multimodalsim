import * as SESSION_STORAGE_KEYS from 'src/app/helpers/local-storage-keys';

export function setIsSimulationLive(isLive:boolean) {
	window.sessionStorage.setItem(SESSION_STORAGE_KEYS.IS_LIVESIM, isLive ? 'true' : 'false');
}

export function isCurrentSimulationLive() {
	return window.sessionStorage.getItem(SESSION_STORAGE_KEYS.IS_LIVESIM) === 'true';
}

export function setCurrentSimulationName(name:string) {
	window.sessionStorage.setItem(SESSION_STORAGE_KEYS.SIMULATION_TO_FETCH, name);
}

export function getCurrentSimulationName() {
	return window.sessionStorage.getItem(SESSION_STORAGE_KEYS.SIMULATION_TO_FETCH);
}

export function setCurrentSim(isLive:boolean, simName:string) {
	setIsSimulationLive(isLive);
	setCurrentSimulationName(simName);
}

export function getCurrentSim():[string|null, boolean] {
	return [getCurrentSimulationName(), isCurrentSimulationLive()];
}

export function removeIsLive() {
	window.sessionStorage.removeItem(SESSION_STORAGE_KEYS.IS_LIVESIM);
}

export function removeSimName() {
	window.sessionStorage.removeItem(SESSION_STORAGE_KEYS.SIMULATION_TO_FETCH);
}

export function setIsRestart(isRestart: boolean) {
	window.sessionStorage.setItem(SESSION_STORAGE_KEYS.IS_LIVESIM, isRestart ? 'true' : 'false');
}

export function isRestart() {
	return window.sessionStorage.getItem(SESSION_STORAGE_KEYS.IS_RESTART) === 'true';
}

export function removeRestart() {
	window.sessionStorage.removeItem(SESSION_STORAGE_KEYS.IS_RESTART);
}

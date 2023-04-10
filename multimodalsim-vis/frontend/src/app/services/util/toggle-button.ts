
export function disableButton(id: string): void {
	const element = document.getElementById(id) as HTMLElement;
	element.style.backgroundColor = '#b1b1b1';
	if (id != 'replay-menu-button') element.style.marginBottom = '10px';
	element.style.pointerEvents = 'none';
}

export function enableButton(id: string): void {
	const element = document.getElementById(id) as HTMLElement;
	element.style.backgroundColor = '#e7e7e7';
	element.style.marginBottom = '5px';
	element.style.pointerEvents = 'auto';
}
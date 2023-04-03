import { Component } from '@angular/core';

@Component({
	selector: 'app-simulation-parameter-modal',
	templateUrl: './simulation-parameter-modal.component.html',
	styleUrls: ['./simulation-parameter-modal.component.css']
})
export class SimulationParameterModalComponent {
	closeModal(){
		const style = document.getElementById('sim-param-modal')?.style;
		if(style) {
			style.visibility = 'hidden';
		}
	}
}

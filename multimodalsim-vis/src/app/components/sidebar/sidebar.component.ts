import { Component } from '@angular/core';

@Component({
	selector: 'app-sidebar',
	templateUrl: './sidebar.component.html',
	styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
	open(): void {
		(document.getElementById('sidebarMenu') as HTMLElement).style.width = '300px';
	}

	close(): void {
		(document.getElementById('sidebarMenu') as HTMLElement).style.width = '0px';
	}
}

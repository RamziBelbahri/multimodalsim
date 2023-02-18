import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulationModalComponent } from './simulation-modal.component';

describe('SimulationModalComponent', () => {
	let component: SimulationModalComponent;
	let fixture: ComponentFixture<SimulationModalComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [SimulationModalComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(SimulationModalComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});

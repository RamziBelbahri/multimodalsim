import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugReceiverComponentComponent } from './debug-receiver-component.component';

describe('DebugReceiverComponentComponent', () => {
	let component: DebugReceiverComponentComponent;
	let fixture: ComponentFixture<DebugReceiverComponentComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [DebugReceiverComponentComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(DebugReceiverComponentComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});

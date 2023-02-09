import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZipHandlerComponent } from './zip-handler.component';

describe('ZipHandlerComponent', () => {
	let component: ZipHandlerComponent;
	let fixture: ComponentFixture<ZipHandlerComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ ZipHandlerComponent ]
		}).compileComponents();
		fixture = TestBed.createComponent(ZipHandlerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});

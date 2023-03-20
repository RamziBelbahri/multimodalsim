import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityInfosComponent } from './entity-infos.component';

describe('EntityInfosComponent', () => {
	let component: EntityInfosComponent;
	let fixture: ComponentFixture<EntityInfosComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ EntityInfosComponent ]
		})
			.compileComponents();

		fixture = TestBed.createComponent(EntityInfosComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});

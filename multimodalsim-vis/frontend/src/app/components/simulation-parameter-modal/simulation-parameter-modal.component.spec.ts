import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulationParameterModalComponent } from './simulation-parameter-modal.component';

describe('SimulationParameterModalComponent', () => {
  let component: SimulationParameterModalComponent;
  let fixture: ComponentFixture<SimulationParameterModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimulationParameterModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimulationParameterModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

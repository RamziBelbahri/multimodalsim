import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaunchModalComponent } from './launch-modal.component';

describe('LaunchModalComponent', () => {
  let component: LaunchModalComponent;
  let fixture: ComponentFixture<LaunchModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LaunchModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LaunchModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

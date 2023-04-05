import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StopsFileModalComponent } from './stops-file-modal.component';

describe('StopsFileModalComponent', () => {
  let component: StopsFileModalComponent;
  let fixture: ComponentFixture<StopsFileModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StopsFileModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StopsFileModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

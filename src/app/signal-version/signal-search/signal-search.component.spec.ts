import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignalSearchComponent } from './signal-search.component';

describe('SignalSearchComponent', () => {
  let component: SignalSearchComponent;
  let fixture: ComponentFixture<SignalSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignalSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignalSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

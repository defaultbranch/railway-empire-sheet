import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadAndSaveComponent } from './load-and-save.component';

describe('LoadAndSaveComponent', () => {
  let component: LoadAndSaveComponent;
  let fixture: ComponentFixture<LoadAndSaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadAndSaveComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoadAndSaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

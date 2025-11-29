import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageExperts } from './manage-experts';

describe('ManageExperts', () => {
  let component: ManageExperts;
  let fixture: ComponentFixture<ManageExperts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageExperts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageExperts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

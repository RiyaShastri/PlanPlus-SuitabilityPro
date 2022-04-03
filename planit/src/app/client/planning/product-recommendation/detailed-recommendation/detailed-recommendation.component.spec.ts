import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailedRecommendationComponent } from './detailed-recommendation.component';

describe('DetailedRecommendationComponent', () => {
  let component: DetailedRecommendationComponent;
  let fixture: ComponentFixture<DetailedRecommendationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailedRecommendationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailedRecommendationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

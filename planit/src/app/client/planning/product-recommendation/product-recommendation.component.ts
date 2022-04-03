import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-product-recommendation',
    templateUrl: './product-recommendation.component.html',
    styleUrls: ['./product-recommendation.component.css']
})
export class ProductRecommendationComponent implements OnInit, OnDestroy {
    clientId;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private router: Router,
        private route: ActivatedRoute,
    ) {
        this.route.parent.parent.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
            this.clientId = params['clientId'];
        });
    }

    ngOnInit() {
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}

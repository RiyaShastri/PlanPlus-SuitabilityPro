import { Component, OnInit, OnDestroy } from '@angular/core';
import { slideInOutAnimation } from '../../shared/animations';
import { AdvisorService } from '../../advisor/service/advisor.service';
import { Store } from '@ngrx/store';
import { AppState, getBrandingDetails } from '../../shared/app.reducer';
import { RefreshDataService } from '../../shared/refresh-data';
import { Angulartics2 } from 'angulartics2';
import { PageTitleService } from '../../shared/page-title';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-graph-colour-theme',
    templateUrl: './graph-colour-theme.component.html',
    styleUrls: ['./graph-colour-theme.component.css'],
    animations: [slideInOutAnimation],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@slideInOutAnimation]': '' }
})
export class GraphColourThemeComponent implements OnInit, OnDestroy {
    themes = [];
    selectedTheme = '';
    brandingDetails: any;
    closeButtonDisable = false;
    private unsubscribe$ = new Subject<void>();
    constructor(
        private advisorService: AdvisorService,
        private store: Store<AppState>,
        private refreshDataService: RefreshDataService,
        private angulartics2: Angulartics2,
        private pageTitleService: PageTitleService,
        private router: Router
    ) {
        this.pageTitleService.setPageTitle('pageTitle|TAB.MY_PROFILE_BRANDING_GRAPH_COLOUR_THEME');
        this.angulartics2.eventTrack.next({ action: 'brandingGraphColourThemeSidePanel' });
    }

    ngOnInit() {
        this.refreshDataService.currentMessage.pipe(takeUntil(this.unsubscribe$)).subscribe(message => {
            if (message.includes('choose_theme|')) {
                this.brandingDetails = JSON.parse(message.replace('choose_theme|', ''));
                this.selectedTheme = this.brandingDetails['selectedGraphColorTheme'];
            } else {
                this.store.select(getBrandingDetails).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
                    if (data) {
                        this.brandingDetails = data;
                        this.selectedTheme = this.brandingDetails['selectedGraphColorTheme'];
                    }
                });
            }
        });

        this.advisorService.getGraphColourThemes().toPromise().then(res => {
            this.themes = res['themes'];
        });
    }

    back() {
        this.router.navigate(['/my-profile', 'branding']);
    }

    getKeys(obj: {}) {
        return Object.keys(obj);
    }

    submitForm() {
        if (JSON.stringify(this.brandingDetails) !== '{}') {
            this.brandingDetails['selectedGraphColorTheme'] = this.selectedTheme;
            // tslint:disable-next-line:triple-equals
            this.brandingDetails['graphColorPalette'].customGraphColorPalette = this.themes.find(theme => theme.id == this.selectedTheme)['colors'];
            this.refreshDataService.changeMessage('choose_theme|' + JSON.stringify(this.brandingDetails));
            this.back();
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}

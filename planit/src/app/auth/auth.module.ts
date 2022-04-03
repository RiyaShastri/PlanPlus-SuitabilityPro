import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../core/core.module';
import { TranslateModule } from '@ngx-translate/core';
import { LoginComponent } from './login/login.component';
import { UserAuthService } from './user-auth.service';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LicenceComponent } from './licence/licence.component';
import { PasswordCompareDirective } from './password-compare.directive';
import { LicenceAcceptComponent } from './licence-accept/licence-accept.component';
import { PrivacyComponent } from './privacy/privacy.component';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        CoreModule,
        TranslateModule,
        RouterModule,
        NgbModule.forRoot()
    ],
    declarations: [
        LoginComponent,
        ChangePasswordComponent,
        PasswordCompareDirective,
        LicenceAcceptComponent,
        LicenceComponent,
        PrivacyComponent
    ],
    exports: [
        LoginComponent,
        LicenceComponent,
        ChangePasswordComponent
    ],
    providers: [
        UserAuthService
    ]
})
export class AuthModule { }

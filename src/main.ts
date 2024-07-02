import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { registerLicense } from '@syncfusion/ej2-base';
import 'zone.js';

registerLicense('Ngo9BigBOggjHTQxAR8/V1NCaF5cXmZCeUx1RHxbf1x0ZFRGal5TTnVaUiweQnxTdEFjXn9ccHFQTmFdU0xwWQ==');

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

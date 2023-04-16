import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

Cesium.Ion.defaultAccessToken =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0ZWNhM2JjOS04NGVkLTQ0MjAtYmE3MS1hYWQxYjhkMWNjZDUiLCJpZCI6MTMyMTU5LCJpYXQiOjE2ODA2MjQ4MDV9.53GMx8EEG1zqqN2qUdb8wt0dFiinVi1KA7mUXK7itFg';
platformBrowserDynamic()
	.bootstrapModule(AppModule)
	.catch((err) => console.error(err));

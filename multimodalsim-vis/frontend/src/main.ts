import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZDlmMzBhMS1mNTM2LTQ0YWMtYmZkOC0xODE2ODM1MTI1YTIiLCJpZCI6MTIxNzYyLCJpYXQiOjE2ODA1Mjk0NTV9.OMJ4zcT384GJq7neO-k97LDPKbJW8BVcA3ZC5QpnCpo';


platformBrowserDynamic()
	.bootstrapModule(AppModule)
	.catch((err) => console.error(err));

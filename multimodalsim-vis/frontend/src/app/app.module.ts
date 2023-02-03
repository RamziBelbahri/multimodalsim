import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { CesiumContainerComponent } from './components/map/cesium-container/cesium-container.component';

@NgModule({
	declarations: [AppComponent, CesiumContainerComponent],
	imports: [BrowserModule],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { CesiumContainerComponent } from './components/map/cesium-container/cesium-container.component';
import { ZipHandlerComponent } from './components/zip-handler/zip-handler.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';


@NgModule({
	declarations: [AppComponent, CesiumContainerComponent, SidebarComponent, ZipHandlerComponent],
	imports: [BrowserModule],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}

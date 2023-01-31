import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { CesiumContainerComponent } from './components/map/cesium-container/cesium-container.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SidebarModule } from 'ng-sidebar';

@NgModule({
	declarations: [AppComponent, CesiumContainerComponent, DashboardComponent],
	imports: [BrowserModule, SidebarModule.forRoot()],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule { }

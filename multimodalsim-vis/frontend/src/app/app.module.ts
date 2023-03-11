import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { CesiumContainerComponent } from './components/map/cesium-container/cesium-container.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DebugReceiverComponentComponent } from './components/debug-receiver/debug-receiver-component.component';
import { SimulationModalComponent } from './components/simulation-modal/simulation-modal.component';
import { EntityInfosComponent } from './components/entity-infos/entity-infos.component';

@NgModule({
	declarations: [AppComponent, CesiumContainerComponent, SidebarComponent, DebugReceiverComponentComponent, SimulationModalComponent, EntityInfosComponent],
	imports: [BrowserModule],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}

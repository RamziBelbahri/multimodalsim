import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { CesiumContainerComponent } from './components/map/cesium-container/cesium-container.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DebugReceiverComponentComponent } from './components/debug-receiver/debug-receiver-component.component';
import { SimulationModalComponent } from './components/simulation-modal/simulation-modal.component';
import { EntityInfosComponent } from './components/sidebar/entity-infos/entity-infos.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinner, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SaveModalComponent } from './components/save-modal/save-modal.component';

@NgModule({
<<<<<<< HEAD
	declarations: [AppComponent, CesiumContainerComponent, SidebarComponent, DebugReceiverComponentComponent, SimulationModalComponent, EntityInfosComponent],
	imports: [BrowserModule, BrowserAnimationsModule, MatDialogModule],
	providers: [],
=======
	declarations: [AppComponent, CesiumContainerComponent, SidebarComponent, DebugReceiverComponentComponent, SimulationModalComponent, SaveModalComponent],
	imports: [BrowserModule, BrowserAnimationsModule, MatDialogModule, MatProgressSpinnerModule, HttpClientModule],
	providers: [MatProgressSpinner],
>>>>>>> 20a9e6805780fbd66101e0ef77087b4322d928b7
	bootstrap: [AppComponent],
})
export class AppModule {}

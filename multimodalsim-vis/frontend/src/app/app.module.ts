import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { CesiumContainerComponent } from './components/map/cesium-container/cesium-container.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DebugReceiverComponentComponent } from './components/debug-receiver/debug-receiver-component.component';
import { SimulationModalComponent } from './components/simulation-modal/simulation-modal.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinner, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SaveModalComponent } from './components/save-modal/save-modal.component';

@NgModule({
	declarations: [AppComponent, CesiumContainerComponent, SidebarComponent, DebugReceiverComponentComponent, SimulationModalComponent, SaveModalComponent],
	imports: [BrowserModule, BrowserAnimationsModule, MatDialogModule, MatProgressSpinnerModule, HttpClientModule],
	providers: [MatProgressSpinner],
	bootstrap: [AppComponent],
})
export class AppModule {}

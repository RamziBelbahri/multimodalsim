/* eslint-disable max-len */
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
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinner, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonToggle, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { SaveModalComponent } from './components/save-modal/save-modal.component';
import { StatsModalComponent } from './components/stats-modal/stats-modal.component';

@NgModule({
	declarations: [AppComponent, CesiumContainerComponent, SidebarComponent, DebugReceiverComponentComponent, SimulationModalComponent, SaveModalComponent, EntityInfosComponent, StatsModalComponent],
	imports: [BrowserModule, BrowserAnimationsModule, FormsModule, MatDialogModule, MatProgressSpinnerModule, HttpClientModule, MatIconModule, MatButtonToggleModule, MatButtonModule],
	providers: [MatProgressSpinner, MatIcon, MatButtonToggle],
	bootstrap: [AppComponent],
})
export class AppModule {}

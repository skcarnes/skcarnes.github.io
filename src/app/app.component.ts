import { Component } from '@angular/core';
import { LaunchDarklyService } from './launch-darkly.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'launch-darkly-proto';

  constructor(launchDarklyService: LaunchDarklyService) {}
}

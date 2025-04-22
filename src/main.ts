import Aurelia from 'aurelia';
import { App } from './app';

Aurelia
  .app(App)
  .start();

  /*
import { Aurelia } from 'aurelia-framework';
import { PLATFORM } from 'aurelia-pal';
import 'tailwindcss/tailwind.css';

export function configure(aurelia: Aurelia): void {
  aurelia.use
    .standardConfiguration()
    .developmentLogging();

  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app')));
}
*/

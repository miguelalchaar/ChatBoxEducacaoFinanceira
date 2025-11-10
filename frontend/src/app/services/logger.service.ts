import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  log(message: string, ...args: any[]): void {
    if (!environment.production) {
      console.log(message, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (!environment.production) {
      console.warn(message, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    console.error(message, ...args);
  }

  info(message: string, ...args: any[]): void {
    if (!environment.production) {
      console.info(message, ...args);
    }
  }
}

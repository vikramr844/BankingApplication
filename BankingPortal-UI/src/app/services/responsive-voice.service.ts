import { Injectable } from '@angular/core';

declare var responsiveVoice: any; // Declare external library

@Injectable({
  providedIn: 'root'
})
export class ResponsiveVoiceService {
  
  constructor() {}

  speak(message: string): void {
    if (typeof responsiveVoice !== 'undefined') {
      responsiveVoice.speak(message, "UK English Male", { rate: 1 });
    } else {
      console.error('❌ ResponsiveVoice.js is not loaded.');
    }
  }
}

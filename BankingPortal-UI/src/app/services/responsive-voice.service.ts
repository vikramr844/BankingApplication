import { Injectable } from '@angular/core';

declare var responsiveVoice: any; // Declare external library

@Injectable({
  providedIn: 'root'
})
export class ResponsiveVoiceService {

  constructor() {}

  speak(message: string, voice: string = "UK English Male", rate: number = 1, onStart?: () => void, onEnd?: () => void): void {
    if (typeof responsiveVoice !== 'undefined') {
      responsiveVoice.speak(message, voice, { 
        rate: rate, 
        onstart: onStart, 
        onend: onEnd 
      });
    } else {
      console.error(' ResponsiveVoice.js is not loaded.');
    }
  }
}

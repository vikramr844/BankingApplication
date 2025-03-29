// voice-assistant.component.ts
import { Component, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-voice-assistant',
  templateUrl: './voice-assistant.component.html',
  styleUrls: ['./voice-assistant.component.css']
})
export class VoiceAssistantComponent {
  isAssistantVisible: boolean = false; // Start hidden by default

  constructor(private cdr: ChangeDetectorRef) {}

  showAssistant() {
    console.log('showAssistant() called');
    this.isAssistantVisible = true;
    this.cdr.detectChanges();
  }

  hideAssistant() {
    this.isAssistantVisible = false;
    this.cdr.detectChanges();
  }

  toggleAssistant() {
    this.isAssistantVisible = !this.isAssistantVisible;
    this.cdr.detectChanges();
  }

  showMicIndicator(): void {
    const micElement = document.getElementById('mic-icon');
    if (micElement) {
      micElement.style.display = 'block';
    }
  }
}
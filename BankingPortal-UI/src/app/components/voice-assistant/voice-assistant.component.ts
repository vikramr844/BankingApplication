// voice-assistant.component.ts
import { Component, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-voice-assistant',
  templateUrl: './voice-assistant.component.html',
  styleUrls: ['./voice-assistant.component.css']
})
export class VoiceAssistantComponent {
  isAssistantVisible: boolean = true;

  constructor(private cdr: ChangeDetectorRef) {}

  showAssistant() {
    console.log('showAssistant() called'); // Debugging
    this.isAssistantVisible = true;
    this.cdr.detectChanges(); // Force change detection
  }

  hideAssistant() {
    this.isAssistantVisible = true;
    this.cdr.detectChanges(); // Force change detection
  }
  showMicIndicator(): void {
    const micElement = document.getElementById('mic-icon');
    if (micElement) {
        micElement.style.display = 'block'; // Show mic icon
    }
}

}
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ApiService } from 'src/app/services/api.service'; // Import your API service
import { ResponsiveVoiceService } from 'src/app/services/responsive-voice.service';
@Component({
  selector: 'app-pin-creation-model',
  templateUrl: './pin-creation-model.component.html',
  styleUrls: ['./pin-creation-model.component.css']
})
export class PinCreationModelComponent implements OnInit {
  @Output() redirect: EventEmitter<void> = new EventEmitter<void>();
  showModal: boolean = false;

  constructor(private apiService: ApiService,private tts: ResponsiveVoiceService) {}

  // Define the speak method
  speak(message: string): void {
    this.tts.speak(message); // Use the TTS service to speak the message
  }
  ngOnInit(): void {
    this.apiService.checkPinCreated().subscribe({
      next: (response: any) => {
        if (!response.hasPIN) {
          this.showModal = true;
          this.tts.speak("You are a new user, so you need to create a PIN."); 
        }
      },
      error: (error: any) => {
        console.error('Error checking PIN status:', error);
      }
    });
  }
  

  onClose(): void {
    this.redirect.emit(); // Notify parent component to redirect to PIN creation page
    this.showModal = false; // Hide modal when closed
  }
}

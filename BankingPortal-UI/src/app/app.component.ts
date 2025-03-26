// app.component.ts
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { VoiceService } from './services/voice.service';
import { VoiceAssistantComponent } from './components/voice-assistant/voice-assistant.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild(VoiceAssistantComponent) voiceAssistant!: VoiceAssistantComponent;

  constructor(private voiceService: VoiceService) {}

  ngOnInit(): void {
    this.voiceService.initializeVoiceCommands();
  }

  ngAfterViewInit(): void {
    this.voiceService.setAssistantComponent(this.voiceAssistant);
  }
}
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VoiceAssistantComponent } from '../components/voice-assistant/voice-assistant.component';
import { VoiceService } from './voice.service';

describe('VoiceAssistantComponent - UI Visibility', () => {
  let component: VoiceAssistantComponent;
  let fixture: ComponentFixture<VoiceAssistantComponent>;
  let voiceService: VoiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VoiceAssistantComponent],
      providers: [VoiceService]
    });

    fixture = TestBed.createComponent(VoiceAssistantComponent);
    component = fixture.componentInstance;
    voiceService = TestBed.inject(VoiceService);
  });

  it('should show the assistant UI when showAssistant() is called', () => {
    // Initially, the UI should be hidden
    const assistantElement = fixture.nativeElement.querySelector('.voice-assistant');
    expect(assistantElement).toBeNull(); // Assuming the UI is hidden by default

    // Call showAssistant() and detect changes
    component.showAssistant();
    fixture.detectChanges();

    // Verify that the UI is now visible
    const updatedAssistantElement = fixture.nativeElement.querySelector('.voice-assistant');
    expect(updatedAssistantElement).toBeTruthy(); // Ensure the UI element is now in the DOM
  });
});
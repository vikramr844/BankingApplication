import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { VoiceAssistantComponent } from './voice-assistant.component';
import { ChangeDetectorRef } from '@angular/core';
import { VoiceService } from '../../services/voice.service';
import { AuthService } from '../../services/auth.service';


describe('VoiceAssistantComponent', () => {
  let component: VoiceAssistantComponent;
  let fixture: ComponentFixture<VoiceAssistantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VoiceAssistantComponent],
      imports: [HttpClientTestingModule],
      providers: [
        ChangeDetectorRef,
        VoiceService,
      
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VoiceAssistantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should show the microphone UI when showAssistant() is called', () => {
    expect(component.isAssistantVisible).toBeFalse();
    component.showAssistant();
    expect(component.isAssistantVisible).toBeTrue();
    fixture.detectChanges();
    const microphoneUI = fixture.nativeElement.querySelector('.voice-assistant-ui');
    expect(microphoneUI).toBeTruthy();
    expect(microphoneUI.textContent).toContain('Listening...');
  });

  it('should hide the microphone UI when hideAssistant() is called', () => {
    component.showAssistant();
    fixture.detectChanges();
    component.hideAssistant();
    expect(component.isAssistantVisible).toBeFalse();
    fixture.detectChanges();
    const microphoneUI = fixture.nativeElement.querySelector('.voice-assistant-ui');
    expect(microphoneUI).toBeNull();
  });
});
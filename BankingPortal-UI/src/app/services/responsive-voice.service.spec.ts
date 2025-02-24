import { TestBed } from '@angular/core/testing';

import { ResponsiveVoiceService } from './responsive-voice.service';

describe('ResponsiveVoiceService', () => {
  let service: ResponsiveVoiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResponsiveVoiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

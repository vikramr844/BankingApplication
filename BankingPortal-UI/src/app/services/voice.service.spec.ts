import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ResponsiveVoiceService } from '../services/responsive-voice.service';
import { VoiceService } from './voice.service';
import { LoginComponent } from '../components/login/login.component';
import { RegisterComponent } from '../components/register/register.component';
import { LoadermodelService } from 'src/app/services/loadermodel.service';
import { FormGroup } from '@angular/forms';

describe('VoiceService', () => {
  let service: VoiceService;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockTts: jasmine.SpyObj<ResponsiveVoiceService>;
  let mockLoader: jasmine.SpyObj<LoadermodelService>;
  let mockLoginComponent: jasmine.SpyObj<LoginComponent>;
  let mockRegisterComponent: jasmine.SpyObj<RegisterComponent>;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockTts = jasmine.createSpyObj('ResponsiveVoiceService', ['speak']);
    mockLoader = jasmine.createSpyObj('LoadermodelService', ['show']);
    mockLoginComponent = jasmine.createSpyObj('LoginComponent', ['onSubmit']);
    mockRegisterComponent = jasmine.createSpyObj('RegisterComponent', ['onSubmit']);

    TestBed.configureTestingModule({
      providers: [
        VoiceService,
        { provide: Router, useValue: mockRouter },
        { provide: ResponsiveVoiceService, useValue: mockTts },
        { provide: LoadermodelService, useValue: mockLoader },
      ],
    });

    service = TestBed.inject(VoiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start listening when "hello" is detected', () => {
    spyOn<any>(service, 'startListening');
    service['handleInput']('hello');
    expect(service['startListening']).toHaveBeenCalled();
  });

  it('should navigate to login when "login" is detected', () => {
    spyOn<any>(service, 'navigateToLogin');
    service['handleInput']('login');
    expect(service['navigateToLogin']).toHaveBeenCalled();
  });

  it('should navigate to register when "register" is detected', () => {
    spyOn<any>(service, 'navigateToRegister');
    service['handleInput']('register');
    expect(service['navigateToRegister']).toHaveBeenCalled();
  });

  it('should process login input correctly', () => {
    service['step'] = 1;
    service['processLogin']('testuser');
    expect(service['userData'].identifier).toBe('testuser');
    expect(service['step']).toBe(2);
  });

  it('should process password input correctly', () => {
    service['step'] = 2;
    service['processLogin']('password123');
    expect(service['userData'].password).toBe('password123');
    expect(service['step']).toBe(3);
  });

  it('should call onSubmit on login confirmation', () => {
    service['step'] = 3;
    service['loginComponent'] = mockLoginComponent;
    service['loginForm'] = new FormGroup({});
    service['processLogin']('confirm');
    expect(mockLoginComponent.onSubmit).toHaveBeenCalled();
  });

  it('should navigate home when "home" is detected', () => {
    service['handleInput']('home');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should stop listening when "stop" is detected', () => {
    spyOn<any>(service, 'stopListening');
    service['handleInput']('stop');
    expect(service['stopListening']).toHaveBeenCalled();
  });
});

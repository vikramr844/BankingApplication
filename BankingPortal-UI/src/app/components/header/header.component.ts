import { ToastService } from 'angular-toastify';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environment/environment';

import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  private authTokenName = environment.tokenName;
  public isUserLoggedIn: boolean = false;
  public isMobile: boolean = window.innerWidth < 768; // Default screen size check

  constructor(
    private authService: AuthService,
    private router: Router,
    private _toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.isUserLoggedIn = this.authService.isLoggedIn();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn(); // Fetch directly from the service
  }
  

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  logout(): void {
    this.authService.logOutUser().subscribe({
      next: () => {
        localStorage.removeItem(this.authTokenName);
        this.isUserLoggedIn = false;
        this.router.navigate(['/']);
      },
      error: (error: any) => {
        console.error('Logout error:', error);
        this._toastService.error(error.error);
      },
    });
  }
}

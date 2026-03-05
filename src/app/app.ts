import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  signal,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
} from '@angular/core';
import {
  AuthModuleLoaderService,
  SinghaAuthElement,
} from './core/services/auth-module-loader.service';

@Component({
  selector: 'app-root',
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit {
  @ViewChild('authEl') private readonly authElRef!: ElementRef<SinghaAuthElement>;

  private readonly authLoader = inject(AuthModuleLoaderService);

  readonly user = signal<Record<string, string> | null>(null);
  readonly isReady = signal(false);
  readonly error = signal<string | null>(null);

  ngAfterViewInit(): void {
    this.authLoader.loadAndInit(this.authElRef.nativeElement).catch((err: unknown) => {
      this.error.set(String(err));
    });
  }

  onAuthReady(event: Event): void {
    const { user } = (event as CustomEvent<{ user: Record<string, string> | null }>).detail;
    console.log('user', user);  
    this.isReady.set(true);
    this.user.set(user);
  }

  onAuthLogin(event: Event): void {
    const { user } = (event as CustomEvent<{ user: Record<string, string> }>).detail;
    this.user.set(user);
  }

  onAuthLogout(): void {
    this.user.set(null);
  }

  onAuthError(event: Event): void {
    const { error } = (event as CustomEvent<{ error: unknown }>).detail;
    this.error.set(String(error));
  }

  login(): void {
    this.authElRef.nativeElement.login();
  }

  logout(): void {
    this.authElRef.nativeElement.logout();
  }
}

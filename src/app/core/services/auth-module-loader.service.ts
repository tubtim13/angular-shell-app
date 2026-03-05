import { Injectable, inject, DOCUMENT } from '@angular/core';
import { ConfigService } from './config.service';
import { AppConfig } from '../interfaces/app-config';

/** Minimal interface for the <singha-auth> custom element. */
export interface SinghaAuthElement extends HTMLElement {
  init(config: Omit<AppConfig, 'AUTH_MODULE_URL'>): Promise<void>;
  login(scopes?: string[]): Promise<void>;
  logout(): Promise<void>;
  readonly user: unknown | null;
  readonly isAuthenticated: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthModuleLoaderService {
  private readonly document = inject(DOCUMENT);
  private readonly configService = inject(ConfigService);

  /**
   * Dynamically injects the Lit auth bundle, waits for the custom element
   * to be defined, then initialises it with MSAL config.
   */
  async loadAndInit(authElement: SinghaAuthElement): Promise<void> {
    const config = this.configService.get();
    await this.injectScript(config.AUTH_MODULE_URL);
    await customElements.whenDefined('singha-auth');
    await authElement.init({
      MSAL_CLIENT_ID: config.MSAL_CLIENT_ID,
      MICROSOFT_TENANT: config.MICROSOFT_TENANT,
      DISABLE_INTERCEPTOR: config.DISABLE_INTERCEPTOR,
      version: config.version,
    });
  }

  private injectScript(url: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.document.querySelector(`script[src="${url}"]`)) {
        resolve();
        return;
      }
      const script = this.document.createElement('script');
      script.type = 'module';
      script.src = url;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error(`AuthModuleLoaderService: failed to load script from ${url}`));
      this.document.head.appendChild(script);
    });
  }
}

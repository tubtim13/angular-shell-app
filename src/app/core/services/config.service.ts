import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppConfig } from '../interfaces/app-config';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly http = inject(HttpClient);
  private config: AppConfig | null = null;

  async load(): Promise<void> {
    this.config = await firstValueFrom(
      this.http.get<AppConfig>('configs/config.json')
    );
  }

  get(): AppConfig {
    if (!this.config) {
      throw new Error('ConfigService: config not loaded. Ensure APP_INITIALIZER ran.');
    }
    return this.config;
  }
}

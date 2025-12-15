import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  getItem(key: string): string | null {
    if (!this.isBrowser) {
      return null;
    }
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  removeItem(key: string): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  clear(): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  getUserId(): number | null {
    const userRaw = this.getItem('user');
    if (!userRaw) return null;
    try {
      const user = JSON.parse(userRaw);
      return user.id_utilisateur || null;
    } catch {
      return null;
    }
  }

  getUser(): any | null {
    const userRaw = this.getItem('user');
    if (!userRaw) return null;
    try {
      return JSON.parse(userRaw);
    } catch {
      return null;
    }
  }

  setUser(user: any): void {
    this.setItem('user', JSON.stringify(user));
  }

  clearUser(): void {
    this.removeItem('user');
  }
}

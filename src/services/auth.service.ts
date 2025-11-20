
import { Injectable, signal, computed } from '@angular/core';

export interface User {
  name: string;
  email: string;
  avatarUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user = signal<User | null>(null);

  isAuthenticated = computed(() => this.user() !== null);

  constructor() {
    // Check for a saved user session on startup
    const savedUser = localStorage.getItem('authUser');
    if (savedUser) {
      this.user.set(JSON.parse(savedUser));
    }
  }

  // Simulate Google Sign-In
  signInWithGoogle() {
    const mockUser: User = {
      name: 'Alex Writer',
      email: 'alex.writer@example.com',
      avatarUrl: 'https://i.pravatar.cc/150?u=alexwriter'
    };
    this.user.set(mockUser);
    localStorage.setItem('authUser', JSON.stringify(mockUser));
  }

  signOut() {
    this.user.set(null);
    localStorage.removeItem('authUser');
  }
}

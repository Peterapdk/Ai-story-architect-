import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { IconGoogle, IconBook } from './icons';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IconGoogle, IconBook],
  template: `
    <div class="w-full max-w-md mx-auto bg-zinc-950/50 border border-zinc-800/50 rounded-2xl shadow-2xl shadow-black/50 p-8 md:p-12 flex flex-col items-center text-center backdrop-blur-xl">
      
      <div class="mb-8">
        <div class="flex items-center justify-center gap-3 text-indigo-400 mb-2">
          <icon-book class="w-7 h-7" />
          <span class="font-bold tracking-wide text-xl text-zinc-100">STORY ARCHITECT</span>
        </div>
        <p class="text-zinc-400">Build your masterpiece, powered by AI.</p>
      </div>

      <div class="w-full my-6">
        <button 
          (click)="auth.signInWithGoogle()"
          class="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-200 text-zinc-800 font-medium px-4 py-3 rounded-lg shadow-lg transition-colors"
        >
          <icon-google class="w-5 h-5" />
          Sign in with Google
        </button>
      </div>
      
      <p class="text-xs text-zinc-600">
        By signing in, you agree to our imaginary Terms of Service. This is a demo application and does not connect to a real Google service.
      </p>

    </div>
  `
})
export class LoginComponent {
  auth = inject(AuthService);
}

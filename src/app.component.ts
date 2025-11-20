
import { Component, inject } from '@angular/core';
import { StoreService } from './services/store.service';
import { LoginComponent } from './components/login.component';
import { DashboardComponent } from './components/dashboard.component';
import { HeaderComponent } from './components/header.component';
import { EditorLayoutComponent } from './components/editor-layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LoginComponent, DashboardComponent, HeaderComponent, EditorLayoutComponent],
  template: `
    <main class="h-screen w-screen bg-zinc-950 text-zinc-100 flex items-center justify-center overflow-hidden">
      
      <!-- Background Effects -->
      <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] bg-gradient-to-tr from-indigo-950 via-zinc-950 to-purple-950/80 rounded-full blur-[150px] opacity-20"></div>

      @switch (store.appState()) {
        @case ('login') {
          <app-login />
        }
        @case ('dashboard') {
          <div class="w-full h-full max-w-6xl mx-auto flex flex-col p-4 md:p-8">
            <app-header />
            <app-dashboard />
          </div>
        }
        @case ('editor') {
          <app-editor-layout />
        }
      }
    </main>
  `
})
export class AppComponent {
  store = inject(StoreService);
}

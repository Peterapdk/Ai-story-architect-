
import { Component, inject, signal, computed, HostListener, viewChild, ElementRef } from '@angular/core';
import { StoreService } from '../services/store.service';
import { AuthService } from '../services/auth.service';
import { IconBook, IconDashboard, IconCloud, IconCloudCheck, IconLoader, IconAlert } from './icons';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [IconBook, IconDashboard, IconCloud, IconCloudCheck, IconLoader, IconAlert],
  template: `
    <header class="flex-shrink-0 flex items-center justify-between h-20 px-6 md:px-8 border-b border-zinc-800/50">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 text-indigo-400">
          <icon-book class="w-5 h-5" />
          <span class="font-bold tracking-wide text-sm text-zinc-300 hidden sm:inline">STORY ARCHITECT</span>
        </div>
        
        @if (store.appState() === 'editor') {
          <div class="h-6 w-px bg-zinc-800"></div>
          <button (click)="store.exitEditor()" class="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
            <icon-dashboard class="w-4 h-4" />
            <span class="hidden sm:inline">Dashboard</span>
          </button>
        }
      </div>
      
      <!-- Save Status for Editor -->
      @if (store.appState() === 'editor' && store.activeProject()) {
        <div class="flex items-center gap-2">
            <div 
              class="flex items-center gap-1.5 text-xs transition-colors"
              [class.text-zinc-500]="saveStatus() === 'idle'"
              [class.text-indigo-400]="saveStatus() === 'saving'"
              [class.text-emerald-400]="saveStatus() === 'saved'"
              [class.text-red-400]="saveStatus() === 'error'"
            >
              @switch (saveStatus()) {
                @case('idle') { <icon-cloud class="w-4 h-4" /> <span></span> }
                @case('saving') { <icon-loader class="w-4 h-4 animate-spin" /> <span>Saving...</span> }
                @case('saved') { <icon-cloud-check class="w-4 h-4" /> <span>All changes saved</span> }
                @case('error') { <icon-alert class="w-4 h-4" /> <span>Save failed</span> }
              }
            </div>
          <button 
            (click)="store.manualSave()"
            [disabled]="saveStatus() !== 'idle'"
            class="px-3 py-1.5 text-xs font-medium bg-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            Save
          </button>
        </div>
      }

      @if (auth.user(); as user) {
        <div class="relative">
          <button #userMenuButton (click)="toggleUserMenu($event)" class="flex items-center gap-2">
            <img [src]="user.avatarUrl" alt="User Avatar" class="w-8 h-8 rounded-full border-2 border-zinc-700">
            <span class="text-sm font-medium text-zinc-300 hidden md:inline">{{ user.name }}</span>
          </button>

          @if (showUserMenu()) {
            <div #userMenu class="absolute top-full right-0 mt-3 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-50 py-1.5">
              <div class="px-3 py-2 border-b border-zinc-800">
                <p class="text-xs font-semibold text-zinc-200 truncate">{{ user.name }}</p>
                <p class="text-xs text-zinc-500 truncate">{{ user.email }}</p>
              </div>
              <button (click)="signOut()" class="w-full text-left text-sm text-red-400 hover:bg-red-500/10 px-3 py-2 mt-1 transition-colors">
                Sign Out
              </button>
            </div>
          }
        </div>
      }
    </header>
  `
})
export class HeaderComponent {
  store = inject(StoreService);
  auth = inject(AuthService);
  showUserMenu = signal(false);

  userMenuButton = viewChild<ElementRef>('userMenuButton');
  userMenu = viewChild<ElementRef>('userMenu');

  saveStatus = computed(() => this.store.saveStatus());

  @HostListener('document:click', ['$event'])
  onGlobalClick(event: MouseEvent) {
    if (this.showUserMenu()) {
      const buttonEl = this.userMenuButton()?.nativeElement;
      const menuEl = this.userMenu()?.nativeElement;
      if (buttonEl && !buttonEl.contains(event.target as Node) && menuEl && !menuEl.contains(event.target as Node)) {
        this.showUserMenu.set(false);
      }
    }
  }

  toggleUserMenu(event: MouseEvent) {
    event.stopPropagation();
    this.showUserMenu.update(v => !v); 
  }

  signOut() {
    this.showUserMenu.set(false);
    this.auth.signOut();
  }
}

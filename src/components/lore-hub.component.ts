
import { Component, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../services/store.service';
import { GeminiService } from '../services/gemini.service';
import { IconCastle, IconLoader } from './icons';

@Component({
  selector: 'app-lore-hub',
  standalone: true,
  imports: [FormsModule, IconCastle, IconLoader],
  template: `
    <div class="flex h-full gap-8">
        <!-- Left Side: Lore Editor -->
        <div class="w-1/2 flex flex-col">
            <div class="flex-shrink-0 mb-4">
                <h2 class="text-2xl font-bold text-zinc-100 tracking-tight">Lore Hub</h2>
                <p class="text-sm text-zinc-400">Flesh out your world. Describe locations, magic systems, factions, etc.</p>
            </div>
            <div class="flex-1 relative group">
                <textarea 
                    [value]="lore()"
                    (input)="updateLore($event.target.value)"
                    placeholder="Build your world here..."
                    class="w-full h-full bg-zinc-900 text-zinc-100 rounded-xl border border-zinc-800 p-4 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-mono text-sm"
                ></textarea>
            </div>
        </div>

        <!-- Right Side: AI Brainstormer -->
        <div class="w-1/2 flex flex-col border-l border-zinc-800 pl-8">
             <div class="flex-shrink-0 mb-4">
                <h2 class="text-2xl font-bold text-zinc-100 tracking-tight">AI Brainstormer</h2>
                <p class="text-sm text-zinc-400">Get ideas for your world when you're feeling stuck.</p>
            </div>
            <div class="flex items-center gap-2 mb-4">
                <input type="text" [(ngModel)]="brainstormQuery" (keyup.enter)="brainstorm()"
                    placeholder="e.g., Suggest three political tensions..."
                    class="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button (click)="brainstorm()" [disabled]="isBrainstorming() || !brainstormQuery.trim()"
                    class="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50">
                    @if(isBrainstorming()) {
                        <icon-loader class="w-4 h-4 animate-spin" />
                    } @else {
                        <icon-castle class="w-4 h-4" />
                    }
                    Brainstorm
                </button>
            </div>
            <div class="flex-1 overflow-y-auto custom-scrollbar border border-zinc-800 bg-zinc-900/50 rounded-xl p-4">
                @if (isBrainstorming()) {
                    <div class="flex items-center justify-center h-full text-zinc-500">
                        <p>Generating ideas...</p>
                    </div>
                } @else if (brainstormResult()) {
                    <pre class="whitespace-pre-wrap font-mono text-sm text-zinc-300">{{ brainstormResult() }}</pre>
                } @else {
                    <div class="flex items-center justify-center h-full text-zinc-600">
                        <p>Brainstorming results will appear here.</p>
                    </div>
                }
            </div>
        </div>
    </div>
  `
})
export class LoreHubComponent {
  store = inject(StoreService);
  gemini = inject(GeminiService);

  lore = computed(() => this.store.activeProject()?.lore || '');
  brainstormQuery = '';
  isBrainstorming = signal(false);
  brainstormResult = signal('');

  updateLore(value: string) {
    this.store.updateProject(p => ({ ...p, lore: value }));
  }

  async brainstorm() {
    if (!this.brainstormQuery.trim() || this.isBrainstorming()) return;
    this.isBrainstorming.set(true);
    this.brainstormResult.set('');
    try {
      const result = await this.gemini.refineText(this.lore(), 'Brainstorming session for world-building.', this.brainstormQuery);
      this.brainstormResult.set(result);
    } catch (e) {
      console.error("Brainstorming failed", e);
    } finally {
      this.isBrainstorming.set(false);
    }
  }
}

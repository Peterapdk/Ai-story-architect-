
import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../services/store.service';
import { GeminiService } from '../services/gemini.service';
import { IconMicroscope, IconLoader } from './icons';
import { MarkdownRendererComponent } from './markdown-renderer.component';

@Component({
  selector: 'app-research-hub',
  standalone: true,
  imports: [FormsModule, IconMicroscope, IconLoader, MarkdownRendererComponent],
  template: `
    <div class="flex h-full gap-8">
        <!-- Left Side: Notepad -->
        <div class="w-1/2 flex flex-col">
            <div class="flex-shrink-0 mb-4">
                <h2 class="text-2xl font-bold text-zinc-100 tracking-tight">Research Notes</h2>
                <p class="text-sm text-zinc-400">Your personal notepad for this project. All content is auto-saved.</p>
            </div>
            <div class="flex-1 relative group">
                <textarea 
                    [value]="researchNotes()"
                    (input)="updateNotes($event.target.value)"
                    placeholder="Jot down research notes, links, and ideas here..."
                    class="w-full h-full bg-zinc-900 text-zinc-100 rounded-xl border border-zinc-800 p-4 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-mono text-sm"
                ></textarea>
            </div>
        </div>

        <!-- Right Side: AI Researcher -->
        <div class="w-1/2 flex flex-col border-l border-zinc-800 pl-8">
             <div class="flex-shrink-0 mb-4">
                <h2 class="text-2xl font-bold text-zinc-100 tracking-tight">AI Researcher</h2>
                <p class="text-sm text-zinc-400">Ask a question to get a grounded answer from Google Search.</p>
            </div>
            <div class="flex items-center gap-2 mb-4">
                <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="research()"
                    placeholder="e.g., Armor of a 14th-century Venetian soldier"
                    class="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button (click)="research()" [disabled]="isSearching() || !searchQuery.trim()"
                    class="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50">
                    @if(isSearching()) {
                        <icon-loader class="w-4 h-4 animate-spin" />
                    } @else {
                        <icon-microscope class="w-4 h-4" />
                    }
                    Research
                </button>
            </div>
            <div class="flex-1 overflow-y-auto custom-scrollbar border border-zinc-800 bg-zinc-900/50 rounded-xl p-4">
                @if (isSearching()) {
                    <div class="flex items-center justify-center h-full text-zinc-500">
                        <p>Searching the web...</p>
                    </div>
                } @else if (searchResult()) {
                    <div class="space-y-4">
                        <app-markdown-renderer [content]="searchResult().text" />
                        @if (searchResult().sources.length > 0) {
                            <div class="pt-4 border-t border-zinc-800">
                                <h4 class="text-xs font-bold uppercase text-zinc-500 mb-2">Sources</h4>
                                <div class="space-y-2">
                                    @for (source of searchResult().sources; track $index) {
                                        <a [href]="source.web?.uri" target="_blank" class="block text-xs text-indigo-400 hover:underline truncate">
                                            {{ source.web?.title || source.web?.uri }}
                                        </a>
                                    }
                                </div>
                            </div>
                        }
                    </div>
                } @else {
                    <div class="flex items-center justify-center h-full text-zinc-600">
                        <p>Research results will appear here.</p>
                    </div>
                }
            </div>
        </div>
    </div>
  `
})
export class ResearchHubComponent {
  store = inject(StoreService);
  gemini = inject(GeminiService);

  researchNotes = computed(() => this.store.activeProject()?.researchNotes || '');
  searchQuery = '';
  isSearching = signal(false);
  searchResult = signal<{ text: string; sources: any[] } | null>(null);

  updateNotes(value: string) {
    this.store.updateProject(p => ({ ...p, researchNotes: value }));
  }

  async research() {
    if (!this.searchQuery.trim() || this.isSearching()) return;
    this.isSearching.set(true);
    this.searchResult.set(null);
    try {
      const result = await this.gemini.researchTopic(this.searchQuery);
      this.searchResult.set(result);
    } catch (e) {
      console.error("Research failed", e);
    } finally {
      this.isSearching.set(false);
    }
  }
}

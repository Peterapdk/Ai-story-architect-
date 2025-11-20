
import { Component, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../services/store.service';
import { GeminiService } from '../services/gemini.service';
import { IconImages, IconLoader } from './icons';

@Component({
  selector: 'app-visuals-editor',
  standalone: true,
  imports: [FormsModule, IconImages, IconLoader],
  template: `
    <div class="flex flex-col h-full">
        <div class="flex-shrink-0 mb-6">
          <h2 class="text-2xl font-bold text-zinc-100 tracking-tight">Visual Style</h2>
          <p class="text-sm text-zinc-400">Describe the imagery, colors, and overall aesthetic, then generate a moodboard.</p>
        </div>

        <div class="flex-1 flex flex-col gap-4 min-h-0">
            <!-- Prompt Input -->
            <div class="flex-shrink-0 flex flex-col gap-2">
                <textarea 
                    [value]="visualsData().prompt"
                    (input)="updatePrompt($event.target.value)"
                    placeholder="e.g., Deep purples, electric blues, rain-slicked black. Neon signs reflecting in puddles, stark silhouettes. Gritty, digital distortion, wet pavement."
                    class="w-full h-28 bg-zinc-950 text-zinc-100 rounded-xl border border-zinc-800 p-4 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-mono text-sm"
                ></textarea>
                 <button (click)="generateMoodboard()" [disabled]="visualsData().isGenerating || !visualsData().prompt"
                    class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-indigo-900/20 transition-all disabled:opacity-50">
                    @if (visualsData().isGenerating) {
                        <icon-loader class="w-4 h-4 animate-spin" /> Generating Moodboard...
                    } @else {
                        <icon-images class="w-4 h-4" /> Generate Moodboard
                    }
                </button>
            </div>
            
            <!-- Moodboard Display -->
            <div class="flex-1 border border-zinc-800 bg-zinc-900/50 rounded-xl p-4 overflow-y-auto custom-scrollbar">
                @if (visualsData().isGenerating) {
                    <div class="grid grid-cols-2 gap-4 animate-pulse">
                        @for (item of [1,2,3,4]; track $index) {
                            <div class="aspect-square bg-zinc-800 rounded-lg"></div>
                        }
                    </div>
                } @else {
                    @if (visualsData().imageUrls.length > 0) {
                        <div class="grid grid-cols-2 gap-4">
                            @for (url of visualsData().imageUrls; track url) {
                                <img [src]="url" alt="Generated moodboard image" class="w-full h-full object-cover rounded-lg aspect-square"/>
                            }
                        </div>
                    } @else {
                        <div class="flex items-center justify-center h-full text-zinc-600">
                            <p>Your 2x2 moodboard will appear here.</p>
                        </div>
                    }
                }
            </div>
        </div>
    </div>
  `
})
export class VisualsEditorComponent {
  store = inject(StoreService);
  gemini = inject(GeminiService);

  visualsData = computed(() => this.store.wizardData()?.visuals || { prompt: '', imageUrls: [], isGenerating: false });

  updatePrompt(value: string) {
    this.store.updateProject(p => ({
      ...p, wizardData: { ...p.wizardData, visuals: { ...p.wizardData.visuals, prompt: value } }
    }));
  }

  async generateMoodboard() {
    const prompt = this.visualsData().prompt;
    if (!prompt.trim() || this.visualsData().isGenerating) return;

    this.store.updateProject(p => ({...p, wizardData: { ...p.wizardData, visuals: { ...p.wizardData.visuals, isGenerating: true } } }));

    try {
      const imageUrls = await this.gemini.generateMoodboard(prompt);
      this.store.updateProject(p => ({...p, wizardData: { ...p.wizardData, visuals: { ...p.wizardData.visuals, imageUrls } } }));
    } catch(e) {
      console.error('Failed to generate moodboard', e);
    } finally {
      this.store.updateProject(p => ({...p, wizardData: { ...p.wizardData, visuals: { ...p.wizardData.visuals, isGenerating: false } } }));
    }
  }
}


import { Component, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../services/store.service';
import { GeminiService } from '../services/gemini.service';
import { StyleAnalysis } from '../services/persistence.service';
import { IconWand, IconLoader } from './icons';
import { MarkdownRendererComponent } from './markdown-renderer.component';

@Component({
  selector: 'app-style-editor',
  standalone: true,
  imports: [FormsModule, IconWand, IconLoader, MarkdownRendererComponent],
  template: `
    <div class="flex flex-col h-full">
        <div class="flex-shrink-0 mb-6">
          <h2 class="text-2xl font-bold text-zinc-100 tracking-tight">Tone & Style</h2>
          <p class="text-sm text-zinc-400">Define the narrative voice. You can describe it, or paste text for the AI to analyze.</p>
        </div>

        <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0">
            <!-- Left Side: Input -->
            <div class="flex flex-col gap-4">
                <h3 class="font-bold text-zinc-300">Style Ingestion</h3>
                <p class="text-xs text-zinc-500 -mt-3">Paste ~500 words from an author you admire to have the AI analyze their style.</p>
                <div class="relative flex-1 group">
                    <textarea 
                        [value]="styleData().sourceText"
                        (input)="updateSourceText($event.target.value)"
                        placeholder="Paste text here to analyze its style..."
                        class="w-full h-full bg-zinc-950 text-zinc-100 rounded-xl border border-zinc-800 p-4 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-mono text-sm"
                    ></textarea>
                </div>
                <button (click)="analyzeStyle()" [disabled]="styleData().isAnalyzing || !styleData().sourceText"
                    class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-indigo-900/20 transition-all disabled:opacity-50">
                    @if (styleData().isAnalyzing) {
                        <icon-loader class="w-4 h-4 animate-spin" /> Analyzing Style...
                    } @else {
                        <icon-wand class="w-4 h-4" /> Analyze Style
                    }
                </button>
            </div>

            <!-- Right Side: Output -->
            <div class="flex flex-col gap-4">
                <h3 class="font-bold text-zinc-300">AI Style Analysis</h3>
                <p class="text-xs text-zinc-500 -mt-3">The AI's description of the style. This will guide the final story generation.</p>
                <div class="flex-1 p-4 rounded-xl border border-zinc-800 bg-zinc-900 custom-scrollbar shadow-inner overflow-y-auto">
                    @if (styleData().analysis) {
                        <app-markdown-renderer [content]="styleData().analysis" />
                    } @else {
                        <div class="flex items-center justify-center h-full text-center text-zinc-600">
                            <p>Analysis will appear here.</p>
                        </div>
                    }
                </div>
                <p class="text-xs text-zinc-600 text-center">You can manually edit this analysis text in the Lore Hub if needed.</p>
            </div>
        </div>
    </div>
  `
})
export class StyleEditorComponent {
  store = inject(StoreService);
  gemini = inject(GeminiService);
  
  styleData = computed(() => this.store.wizardData()?.tone || { sourceText: '', analysis: '', isAnalyzing: false });

  updateSourceText(value: string) {
    this.store.updateProject(p => ({
        ...p, wizardData: { ...p.wizardData, tone: { ...p.wizardData.tone, sourceText: value } }
    }));
  }

  async analyzeStyle() {
    const sourceText = this.styleData().sourceText;
    if (!sourceText.trim() || this.styleData().isAnalyzing) return;
    
    this.store.updateProject(p => ({ ...p, wizardData: { ...p.wizardData, tone: { ...p.wizardData.tone, isAnalyzing: true } } }));

    try {
      const analysis = await this.gemini.analyzeStyle(sourceText);
      this.store.updateProject(p => ({ ...p, wizardData: { ...p.wizardData, tone: { ...p.wizardData.tone, analysis } } }));
    } catch (e) {
      console.error('Failed to analyze style', e);
      // You might want to show an error message to the user here.
    } finally {
      this.store.updateProject(p => ({ ...p, wizardData: { ...p.wizardData, tone: { ...p.wizardData.tone, isAnalyzing: false } } }));
    }
  }
}

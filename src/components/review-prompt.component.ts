
import { Component, inject, computed, effect } from '@angular/core';
import { StoreService } from '../services/store.service';
import { GeminiService } from '../services/gemini.service';
import { WizardData } from '../services/persistence.service';
import { IconLightbulb, IconLoader } from './icons';
import { MarkdownRendererComponent } from './markdown-renderer.component';

@Component({
  selector: 'app-review-prompt',
  standalone: true,
  imports: [IconLightbulb, IconLoader, MarkdownRendererComponent],
  template: `
    <div class="flex flex-col h-full">
        <div class="flex-shrink-0 mb-6 flex justify-between items-start">
            <div>
                <h2 class="text-2xl font-bold text-zinc-100 tracking-tight">Review & Refine</h2>
                <p class="text-sm text-zinc-400">Review the complete prompt and get AI feedback before generating your story.</p>
            </div>
             <button (click)="analyzePrompt()" [disabled]="reviewData().isAnalyzing || !reviewData().fullPrompt"
                class="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-indigo-900/20 transition-all disabled:opacity-50">
                @if (reviewData().isAnalyzing) {
                    <icon-loader class="w-4 h-4 animate-spin" /> Analyzing...
                } @else {
                    <icon-lightbulb class="w-4 h-4" /> Get Feedback
                }
            </button>
        </div>

        <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0">
            <!-- Left Side: Full Prompt -->
            <div class="flex flex-col gap-4">
                <h3 class="font-bold text-zinc-300">Final Prompt</h3>
                <div class="flex-1 p-4 rounded-xl border border-zinc-800 bg-zinc-900 custom-scrollbar shadow-inner overflow-y-auto">
                    <pre class="whitespace-pre-wrap font-mono text-xs text-zinc-400">{{ reviewData().fullPrompt }}</pre>
                </div>
            </div>

            <!-- Right Side: AI Analysis -->
             <div class="flex flex-col gap-4">
                <h3 class="font-bold text-zinc-300">AI Feedback</h3>
                <div class="flex-1 p-4 rounded-xl border border-zinc-800 bg-zinc-900 custom-scrollbar shadow-inner overflow-y-auto">
                    @if (reviewData().analysis) {
                        <app-markdown-renderer [content]="reviewData().analysis" />
                    } @else {
                        <div class="flex items-center justify-center h-full text-center text-zinc-600">
                            <p>AI feedback will appear here.</p>
                        </div>
                    }
                </div>
            </div>
        </div>
    </div>
  `
})
export class ReviewPromptComponent {
  store = inject(StoreService);
  gemini = inject(GeminiService);

  reviewData = computed(() => this.store.wizardData()?.review || { isAnalyzing: false, analysis: '', fullPrompt: '' });

  constructor() {
    effect(() => {
      const wizardData = this.store.wizardData();
      if (wizardData) {
        this.compileFullPrompt(wizardData);
      }
    }, { allowSignalWrites: true });
  }

  compileFullPrompt(wizardData: WizardData) {
    const prompt = `
Act as a best-selling author. Write a compelling story based on the following architectural blueprint.

--- CORE IDEA ---
${wizardData.idea.prompt}

--- CHARACTERS ---
${wizardData.characters.map(c => `Name: ${c.name}\nDescription: ${c.description}\nMotivation: ${c.motivation}`).join('\n\n')}

--- SETTING ---
${wizardData.setting.prompt}

--- TONE & STYLE ---
${wizardData.tone.analysis || 'Not specified.'}

--- PLOT POINTS ---
${wizardData.plot.map(p => `- ${p.title}: ${p.description}`).join('\n')}

--- VISUAL STYLE / IMAGERY ---
${wizardData.visuals.prompt}

Write the story now. Use Markdown for formatting (headers, bold, italics).
    `;
    this.store.updateProject(p => ({ ...p, wizardData: { ...p.wizardData, review: { ...p.wizardData.review, fullPrompt: prompt.trim() } } }));
  }

  async analyzePrompt() {
    const fullPrompt = this.reviewData().fullPrompt;
    if (!fullPrompt || this.reviewData().isAnalyzing) return;
    
    this.store.updateProject(p => ({ ...p, wizardData: { ...p.wizardData, review: { ...p.wizardData.review, isAnalyzing: true } } }));
    
    try {
        const analysis = await this.gemini.analyzePrompt(fullPrompt);
        this.store.updateProject(p => ({ ...p, wizardData: { ...p.wizardData, review: { ...p.wizardData.review, analysis } } }));
    } catch(e) {
        console.error("Failed to analyze prompt", e);
    } finally {
        this.store.updateProject(p => ({ ...p, wizardData: { ...p.wizardData, review: { ...p.wizardData.review, isAnalyzing: false } } }));
    }
  }
}

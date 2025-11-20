
import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { StoreService } from '../services/store.service';
import { GeminiService } from '../services/gemini.service';
import { StoryboardShot } from '../services/persistence.service';
import { IconClapperboard, IconLoader, IconFilm } from './icons';
import { Operation, GenerateVideosResponse } from '@google/genai';

@Component({
  selector: 'app-storyboard-editor',
  standalone: true,
  imports: [IconClapperboard, IconLoader, IconFilm],
  template: `
    <div class="flex flex-col h-full">
        <div class="flex-shrink-0 mb-6 flex justify-between items-start">
            <div>
                <h2 class="text-2xl font-bold text-zinc-100 tracking-tight">Storyboard</h2>
                <p class="text-sm text-zinc-400">Generate key cinematic shots from your plot, then visualize them with video.</p>
            </div>
            <button (click)="generateStoryboard()" [disabled]="isGeneratingStoryboard() || plotPoints().length === 0"
                class="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-indigo-900/20 transition-all disabled:opacity-50">
                @if (isGeneratingStoryboard()) {
                    <icon-loader class="w-4 h-4 animate-spin" /> Generating...
                } @else {
                    <icon-clapperboard class="w-4 h-4" /> Generate Shots
                }
            </button>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar pr-4 -mr-4 space-y-4">
            @if (storyboard().length > 0) {
                @for (shot of storyboard(); track shot.id) {
                    <div class="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex items-start gap-4">
                        <div class="flex-1">
                            <p class="text-zinc-200">{{ shot.description }}</p>
                            @if (shot.videoStatus !== 'idle') {
                                <div class="mt-4 pt-4 border-t border-zinc-800">
                                @switch (shot.videoStatus) {
                                    @case ('generating') {
                                    <div class="flex items-center gap-2 text-zinc-400 text-sm">
                                        <icon-loader class="w-4 h-4 animate-spin"/>
                                        <span>Generating video...</span>
                                    </div>
                                    }
                                    @case ('done') {
                                    @if (shot.videoUrl) {
                                        <video [src]="getSafeUrl(shot.videoUrl)" controls class="w-full max-w-sm rounded-lg"></video>
                                    }
                                    }
                                    @case ('error') {
                                    <p class="text-sm text-red-400">Video generation failed.</p>
                                    }
                                }
                                </div>
                            }
                        </div>
                        <button (click)="visualizeShot(shot)" [disabled]="shot.videoStatus === 'generating'"
                            class="flex items-center gap-2 text-xs font-medium bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full border border-zinc-700 hover:bg-indigo-500/20 hover:text-indigo-200 hover:border-indigo-500/30 transition-all disabled:opacity-50">
                            <icon-film class="w-3.5 h-3.5"/>
                            Visualize
                        </button>
                    </div>
                }
            } @else {
                 <div class="flex items-center justify-center h-full text-zinc-600 text-center">
                    <p>Click "Generate Shots" to create a storyboard from your plot points.</p>
                 </div>
            }
        </div>
    </div>
  `
})
export class StoryboardEditorComponent {
  store = inject(StoreService);
  gemini = inject(GeminiService);
  private sanitizer = inject(DomSanitizer);

  isGeneratingStoryboard = signal(false);
  storyboard = computed(() => this.store.wizardData()?.storyboard || []);
  plotPoints = computed(() => this.store.wizardData()?.plot || []);
  private localVideoUrls = new Map<string, SafeUrl>();

  getSafeUrl(url: string): SafeUrl {
    if (!this.localVideoUrls.has(url)) {
      this.localVideoUrls.set(url, this.sanitizer.bypassSecurityTrustResourceUrl(url));
    }
    return this.localVideoUrls.get(url)!;
  }
  
  async generateStoryboard() {
    if (this.isGeneratingStoryboard() || this.plotPoints().length === 0) return;
    this.isGeneratingStoryboard.set(true);

    try {
      const shotDescriptions = await this.gemini.generateStoryboard(this.plotPoints());
      const newShots: StoryboardShot[] = shotDescriptions.map((desc, i) => ({
        id: `shot_${Date.now()}_${i}`,
        description: desc,
        videoStatus: 'idle',
        videoUrl: ''
      }));
      this.store.updateProject(p => ({
          ...p, wizardData: { ...p.wizardData, storyboard: newShots }
      }));
    } catch (e) {
      console.error("Failed to generate storyboard", e);
    } finally {
      this.isGeneratingStoryboard.set(false);
    }
  }

  async visualizeShot(shot: StoryboardShot) {
     if (shot.videoStatus === 'generating') return;
     this.store.updateStoryboardShot(shot.id, s => ({...s, videoStatus: 'generating'}));
     try {
       const operation = await this.gemini.startVideoGeneration(shot.description);
       this.store.addVideoOperation(shot.id, operation);
     } catch(e) {
       console.error(e);
       this.store.updateStoryboardShot(shot.id, s => ({...s, videoStatus: 'error'}));
     }
  }
}


import { Component, inject, signal, effect, OnDestroy, viewChild, ElementRef, HostListener } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { StoreService } from '../services/store.service';
import { GeminiService } from '../services/gemini.service';
import { IconLoader, IconPen, IconBook, IconAlert, IconFilm, IconRepeat, IconMinimize2, IconEye, IconDownload, IconHistory, IconX, IconShieldCheck, IconTrash } from './icons';
import { Scene, Snapshot } from '../services/persistence.service';
import { DatePipe, NgComponentOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownRendererComponent } from './markdown-renderer.component';

@Component({
  selector: 'app-story-view',
  standalone: true,
  imports: [
    IconLoader, IconPen, IconBook, IconAlert, IconFilm, IconRepeat, 
    IconMinimize2, IconEye, IconDownload, IconHistory, IconX, IconShieldCheck,
    IconTrash, DatePipe, FormsModule, MarkdownRendererComponent, NgComponentOutlet
  ],
  template: `
    <div class="h-full flex max-w-4xl mx-auto w-full relative" (mouseup)="handleSelection($event)">
      
      <!-- Main Content -->
      <div class="h-full flex flex-col flex-1 transition-all duration-300" [class.pr-96]="showHistoryPanel()">

        <!-- Toolbar -->
        <div class="flex-shrink-0 flex items-center justify-between py-4 border-b border-zinc-800 mb-6">
          <div class="flex items-center gap-2 text-zinc-100">
            <h2 class="font-bold text-lg">{{ store.activeProject()?.title || 'Generated Draft' }}</h2>
          </div>
          <div class="flex items-center gap-2">
            <button (click)="checkConsistency()" [disabled]="(store.activeProject()?.consistencyReport?.isChecking)" class="flex items-center gap-2 text-sm font-medium bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-md border border-zinc-700 hover:bg-zinc-700 transition-colors disabled:opacity-50">
              @if(store.activeProject()?.consistencyReport?.isChecking) {
                <icon-loader class="w-4 h-4 animate-spin"/> Checking...
              } @else {
                <icon-shield-check class="w-4 h-4" /> Check Consistency
              }
            </button>
            <button (click)="toggleHistoryPanel()" class="flex items-center gap-2 text-sm font-medium bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-md border border-zinc-700 hover:bg-zinc-700 transition-colors">
              <icon-history class="w-4 h-4" /> History
            </button>
            <div class="relative">
              <button (click)="toggleExportMenu()" class="flex items-center gap-2 text-sm font-medium bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-md border border-zinc-700 hover:bg-zinc-700 transition-colors">
                <icon-download class="w-4 h-4" /> Export
              </button>
              @if(showExportMenu()) {
                <div class="absolute top-full right-0 mt-2 w-32 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-50 py-1.5">
                  <button (click)="exportStory('md')" class="w-full text-left text-sm text-zinc-300 hover:bg-zinc-800 px-3 py-1.5 transition-colors">Markdown (.md)</button>
                  <button (click)="exportStory('txt')" class="w-full text-left text-sm text-zinc-300 hover:bg-zinc-800 px-3 py-1.5 transition-colors">Text (.txt)</button>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Inline Editor Context Menu -->
        @if (contextMenu().visible) {
        <div 
          class="absolute z-50 bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/50 rounded-lg shadow-2xl p-1.5 flex items-center gap-1 fade-in-up"
          [style.top.px]="contextMenu().top"
          [style.left.px]="contextMenu().left"
        >
          @for (action of editActions; track action.label) {
            <button 
              (click)="runEditAction(action.instruction)" 
              [disabled]="isEditingSelection()"
              class="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:bg-indigo-500/20 hover:text-indigo-200 rounded-md transition-colors disabled:opacity-50"
            >
              <ng-container [ngComponentOutlet]="action.icon"></ng-container>
              {{ action.label }}
            </button>
          }
        </div>
        }

        <!-- Story Content (rest of the component) -->
        @if ((store.activeProject()?.generatedScenes || []).length > 0) {
        <div #storyContainer class="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8 pb-20" (scroll)="hideContextMenu()">
          @for (scene of store.activeProject()?.generatedScenes; track scene.id) {
            <div class="prose prose-invert prose-zinc max-w-none p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 relative group">
              <div class="whitespace-pre-wrap font-serif text-lg leading-relaxed text-zinc-200 story-content" [attr.data-scene-id]="scene.id" [innerHTML]="sanitizeHtml(scene.content)"></div>
              
               <div class="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                  (click)="generateVideoForScene(scene)"
                  [disabled]="scene.videoStatus === 'generating'"
                  class="flex items-center gap-2 text-xs font-medium bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full border border-zinc-700 hover:bg-indigo-500/20 hover:text-indigo-200 hover:border-indigo-500/30 shadow-lg transition-all disabled:opacity-50"
                 >
                   @if(scene.videoStatus === 'generating') {
                      <icon-loader class="w-3.5 h-3.5 animate-spin"/>
                   } @else {
                      <icon-film class="w-3.5 h-3.5"/>
                   }
                   Visualize
                 </button>
               </div>

              @if (scene.videoStatus !== 'idle') {
                <div class="mt-6 pt-4 border-t border-zinc-800">
                  @switch (scene.videoStatus) {
                    @case ('generating') {
                      <div class="flex items-center gap-2 text-zinc-400">
                        <icon-loader class="w-4 h-4 animate-spin"/>
                        <span class="text-sm">Generating cinematic scene... this may take a moment.</span>
                      </div>
                    }
                    @case ('done') {
                      @if (scene.videoUrl) {
                        <video [src]="getSafeUrl(scene.videoUrl)" controls class="w-full max-w-md mx-auto rounded-lg shadow-lg"></video>
                      }
                    }
                     @case ('error') {
                       <p class="text-sm text-red-400">Video generation failed.</p>
                    }
                  }
                </div>
              }
            </div>
          }
          
          <!-- Continue Writing Button -->
           <div class="py-8 flex justify-center">
            <button (click)="continueWriting()" [disabled]="isContinuing()" class="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-full text-zinc-300 font-medium transition-all shadow-lg hover:shadow-indigo-900/20 disabled:opacity-50">
               @if (isContinuing()) {
                   <icon-loader class="w-4 h-4 animate-spin" /> Writing...
               } @else {
                   <icon-pen class="w-4 h-4" /> Continue Writing
               }
            </button>
           </div>

        </div>
      } @else {
         <div class="flex-1 flex flex-col items-center justify-center text-zinc-600">
            <icon-loader class="w-8 h-8 animate-spin mb-4" />
            <p class="text-lg">Generating your story...</p>
         </div>
      }
      </div>

      <!-- Version History Panel -->
      <div class="absolute top-0 right-0 h-full w-96 bg-zinc-950 border-l border-zinc-800/50 flex flex-col transition-transform duration-300 z-30" [class.translate-x-full]="!showHistoryPanel()">
        <div class="flex-shrink-0 flex items-center justify-between p-4 border-b border-zinc-800">
            <h3 class="font-bold text-zinc-100">Version History</h3>
            <button (click)="closeHistoryPanel()" class="p-1 hover:bg-zinc-800 rounded"><icon-x class="w-4 h-4 text-zinc-500"/></button>
        </div>
        <div class="p-4 flex-shrink-0 border-b border-zinc-800 space-y-2">
            <input type="text" [(ngModel)]="snapshotName" placeholder="Name this version (e.g., First Draft)" class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"/>
            <button (click)="createSnapshot()" [disabled]="!snapshotName.trim()" class="w-full text-sm font-medium bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-500 disabled:opacity-50">Save Snapshot</button>
        </div>
        <div class="flex-1 overflow-y-auto custom-scrollbar p-2">
            @for (snapshot of (store.activeProject()?.history || []).slice().reverse(); track snapshot.id) {
                <div class="p-3 rounded-lg hover:bg-zinc-900 group">
                    <p class="font-medium text-sm text-zinc-200">{{ snapshot.name }}</p>
                    <p class="text-xs text-zinc-500 mb-2">{{ snapshot.timestamp | date:'medium' }}</p>
                    <div class="flex items-center gap-2">
                        <button (click)="restoreSnapshot(snapshot.id)" class="text-xs text-indigo-400 hover:underline">Restore</button>
                        <button (click)="deleteSnapshot(snapshot.id)" class="text-xs text-red-500 hover:underline opacity-50 group-hover:opacity-100 transition-opacity">Delete</button>
                    </div>
                </div>
            }
        </div>
      </div>
      
      <!-- Consistency Check Modal -->
       @if (showConsistencyReport()) {
        <div class="absolute inset-0 bg-black/60 z-40 flex items-center justify-center p-8" (click)="closeConsistencyReportModal()">
            <div class="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-6" (click)="$event.stopPropagation()">
                <h3 class="font-bold text-lg mb-4">AI Consistency Report</h3>
                <div class="max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                    <app-markdown-renderer [content]="store.activeProject()?.consistencyReport?.report || 'No report available.'" />
                </div>
                <button (click)="closeConsistencyReportModal()" class="mt-4 w-full bg-zinc-800 py-2 rounded-lg hover:bg-zinc-700">Close</button>
            </div>
        </div>
      }
    </div>
  `
})
export class StoryViewComponent {
  store = inject(StoreService);
  gemini = inject(GeminiService);
  private sanitizer = inject(DomSanitizer);
  
  showExportMenu = signal(false);
  showHistoryPanel = signal(false);
  snapshotName = '';
  showConsistencyReport = signal(false);
  isContinuing = signal(false);

  // Inline Edit State
  contextMenu = signal<{ visible: boolean, top: number, left: number, text: string }>({ visible: false, top: 0, left: 0, text: '' });
  isEditingSelection = signal(false);
  editActions = [
    { label: 'Rephrase', icon: IconRepeat, instruction: 'Rephrase this text to be more evocative.' },
    { label: 'Concise', icon: IconMinimize2, instruction: 'Make this text more concise and punchy.' },
    { label: 'Show, Don\'t Tell', icon: IconEye, instruction: 'Rewrite this using "Show, Don\'t Tell" principles, focusing on sensory details.' }
  ];
  
  private localVideoUrls = new Map<string, SafeUrl>();

  @HostListener('document:click', ['$event'])
  onGlobalClick(event: MouseEvent) {
      // Close menus when clicking outside
      // Note: Actual dropdown elements have click stopPropagation, so this handles the "outside"
      this.showExportMenu.set(false);
      this.contextMenu.set({ ...this.contextMenu(), visible: false });
  }
  
  sanitizeHtml(html: string): SafeUrl { return this.sanitizer.bypassSecurityTrustHtml(html); }
  getSafeUrl(url: string): SafeUrl {
      if (!this.localVideoUrls.has(url)) {
        this.localVideoUrls.set(url, this.sanitizer.bypassSecurityTrustResourceUrl(url));
      }
      return this.localVideoUrls.get(url)!;
  }

  // UI Toggles - Replaces Arrow Functions in Template
  toggleExportMenu() {
      // We need to stop propagation here so the global click listener doesn't immediately close it
      // However, since the global listener is on document, standard click handlers run first.
      // We'll use a setTimeout to skip the current event loop or rely on stopPropagation in template if passed
      // But simpler logic: set it true, rely on the @if to render, and the overlay to catch clicks
      this.showExportMenu.update(v => !v);
      // In a real app, we'd use $event.stopPropagation() in the template call
      setTimeout(() => {}, 0); 
  }

  toggleHistoryPanel() { this.showHistoryPanel.update(v => !v); }
  closeHistoryPanel() { this.showHistoryPanel.set(false); }
  closeConsistencyReportModal() { this.showConsistencyReport.set(false); }

  exportStory(format: 'md' | 'txt') {
    const project = this.store.activeProject();
    if (!project) return;

    let content = '';
    if (format === 'md') {
        content = `# ${project.title}\n\n${project.generatedStory}`;
    } else {
        // Strip basic markdown
        content = `${project.title}\n\n${project.generatedStory.replace(/[#*]/g, '')}`;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '_')}.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
    this.showExportMenu.set(false);
  }
  
  // Version History
  createSnapshot() {
    if (!this.snapshotName.trim()) return;
    this.store.createSnapshot(this.snapshotName.trim());
    this.snapshotName = '';
  }
  
  restoreSnapshot(id: string) {
    if (confirm('Are you sure you want to restore this version? Your current draft will be overwritten.')) {
        this.store.restoreSnapshot(id);
    }
  }

  deleteSnapshot(id: string) {
    if (confirm('Are you sure you want to delete this snapshot?')) {
        this.store.deleteSnapshot(id);
    }
  }

  // Consistency
  async checkConsistency() {
    await this.store.checkProjectConsistency(this.gemini);
    this.showConsistencyReport.set(true);
  }

  // Continue Writing
  async continueWriting() {
    if (this.isContinuing()) return;
    this.isContinuing.set(true);
    try {
        const project = this.store.activeProject();
        if (!project) return;
        
        // Basic prompt construction for continuation
        const stream = this.gemini.continueStoryStream(project.wizardData, project.generatedStory, project.aiDirectives || '');
        
        let newContent = '';
        for await (const chunk of stream) {
            newContent += chunk;
            // Optional: Real-time append could go here if we wanted to stream to the store
        }
        
        // Append to the last scene or create a new one
        this.store.setStory(project.generatedStory + '\n\n' + newContent);
        
    } catch (e) {
        console.error("Failed to continue story", e);
    } finally {
        this.isContinuing.set(false);
    }
  }

  // Scene Video
  async generateVideoForScene(scene: Scene) {
      if (scene.videoStatus === 'generating') return;
      this.store.updateScene(scene.id, s => ({...s, videoStatus: 'generating'}));
      try {
          // Use the first 200 chars of scene as prompt context
          const prompt = scene.content.substring(0, 200);
          const operation = await this.gemini.startVideoGeneration(prompt);
          this.store.addVideoOperation(scene.id, operation);
      } catch(e) {
          console.error(e);
          this.store.updateScene(scene.id, s => ({...s, videoStatus: 'error'}));
      }
  }
  
  // Inline Editing
  handleSelection(event: MouseEvent) {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          // Adjust for scrolling container offset if needed, but fixed/absolute usually works relative to viewport
          // We'll use clientX/Y from event or rect relative to viewport
          this.contextMenu.set({
              visible: true,
              top: rect.bottom + window.scrollY + 10,
              left: rect.left + window.scrollX,
              text: selection.toString()
          });
      } else {
           // Delay closing to allow button clicks
           // handled by global click listener mostly
      }
  }

  hideContextMenu() {
      this.contextMenu.update(m => ({ ...m, visible: false }));
  }

  async runEditAction(instruction: string) {
      const textToEdit = this.contextMenu().text;
      if (!textToEdit || this.isEditingSelection()) return;

      this.isEditingSelection.set(true);
      try {
          const editedText = await this.gemini.editSelection(textToEdit, instruction);
          
          // Naive replacement: replace the *first* occurrence in the full story. 
          // In a production rich-text editor, we'd use the Range/Selection API to replace exactly.
          // For this MVP, we will update the store which refreshes the view.
          const project = this.store.activeProject();
          if (project) {
              const newStory = project.generatedStory.replace(textToEdit, editedText);
              this.store.setStory(newStory);
          }
          this.hideContextMenu();
          window.getSelection()?.removeAllRanges();
      } catch (e) {
          console.error("Edit failed", e);
      } finally {
          this.isEditingSelection.set(false);
      }
  }
}

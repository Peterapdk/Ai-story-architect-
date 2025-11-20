
import { Component, inject, effect } from '@angular/core';
import { StoreService } from '../services/store.service';
import { GeminiService } from '../services/gemini.service';
import { HeaderComponent } from './header.component';
import { WizardComponent } from './wizard.component';
import { ResearchHubComponent } from './research-hub.component';
import { LoreHubComponent } from './lore-hub.component';
import { StoryViewComponent } from './story-view.component';
import { CharacterChatComponent } from './character-chat.component';
import { IconBook, IconMicroscope, IconCastle, IconPen, IconMessageSquare } from './icons';
import { NgComponentOutlet } from '@angular/common';

@Component({
  selector: 'app-editor-layout',
  standalone: true,
  imports: [HeaderComponent, WizardComponent, ResearchHubComponent, LoreHubComponent, StoryViewComponent, CharacterChatComponent, NgComponentOutlet, IconBook, IconMicroscope, IconCastle, IconPen, IconMessageSquare],
  template: `
    <div class="w-full h-full max-w-7xl mx-auto bg-zinc-950/70 border border-zinc-800/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col relative backdrop-blur-xl">
      <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-50"></div>
      <app-header />
      
      <div class="flex-1 flex overflow-hidden">
        <!-- Main Navigation Tabs -->
        <div class="w-20 flex-shrink-0 flex flex-col items-center gap-2 py-8 border-r border-zinc-800/50 bg-zinc-950/50">
          @for (tab of tabs; track tab.id) {
            <button 
              (click)="store.setEditorView(tab.id)"
              class="w-16 h-16 flex flex-col items-center justify-center gap-1 rounded-lg transition-colors relative"
              [class]="store.editorView() === tab.id ? 'bg-indigo-500/10 text-indigo-300' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'"
              [title]="tab.label"
            >
              <ng-container [ngComponentOutlet]="tab.icon"></ng-container>
              <span class="text-[10px] font-bold">{{ tab.label }}</span>
              @if (store.editorView() === tab.id) {
                <div class="absolute -right-1 top-1/2 -translate-y-1/2 h-6 w-1.5 bg-indigo-500 rounded-full"></div>
              }
            </button>
          }
        </div>
        
        <!-- Main Content Area -->
        <div class="flex-1 overflow-hidden p-6 md:p-8">
            @switch (store.editorView()) {
                @case ('wizard') { <app-wizard /> }
                @case ('research') { <app-research-hub /> }
                @case ('lore') { <app-lore-hub /> }
                @case ('story') { <app-story-view /> }
                @case ('chat') { <app-character-chat /> }
            }
        </div>
      </div>
    </div>
  `
})
export class EditorLayoutComponent {
  store = inject(StoreService);
  gemini = inject(GeminiService);

  tabs = [
    { id: 'wizard', label: 'Wizard', icon: IconBook },
    { id: 'research', label: 'Research', icon: IconMicroscope },
    { id: 'lore', label: 'Lore', icon: IconCastle },
    { id: 'chat', label: 'Chat', icon: IconMessageSquare },
    { id: 'story', label: 'Story', icon: IconPen }
  ];
  
  constructor() {
    // This effect triggers story generation when the user switches to the 'story' view
    // and the story hasn't been generated yet.
    effect(async () => {
      const view = this.store.editorView();
      const project = this.store.activeProject();
      
      if (view === 'story' && project && !project.generatedStory) {
        const fullPrompt = project.wizardData.review.fullPrompt;
        if (!fullPrompt) {
          console.error("Cannot generate story: full prompt is not compiled.");
          return;
        }

        try {
          let fullStory = '';
          const stream = this.gemini.generateStoryStream(project.wizardData, fullPrompt);
          for await (const chunk of stream) {
            fullStory += chunk;
            this.store.updateProject(p => ({...p, generatedStory: fullStory}));
          }
          this.store.setStory(fullStory); // Finalize and split into scenes
        } catch (e: any) {
          console.error('Failed to generate story.', e);
        }
      }
    }, { allowSignalWrites: true });
  }
}

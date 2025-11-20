
import { Component, inject } from '@angular/core';
import { StoreService } from '../services/store.service';
import { StepInputComponent } from './step-input.component';
import { IconChevronLeft, IconChevronRight, IconBook } from './icons';
import { DecimalPipe } from '@angular/common';

// Import new specialized editors
import { CharacterEditorComponent } from './character-editor.component';
import { PlotEditorComponent } from './plot-editor.component';
import { StyleEditorComponent } from './style-editor.component';
import { VisualsEditorComponent } from './visuals-editor.component';
import { StoryboardEditorComponent } from './storyboard-editor.component';
import { ReviewPromptComponent } from './review-prompt.component';


@Component({
  selector: 'app-wizard',
  standalone: true,
  imports: [
    StepInputComponent, IconChevronLeft, IconChevronRight, IconBook,
    CharacterEditorComponent, PlotEditorComponent, StyleEditorComponent,
    VisualsEditorComponent, StoryboardEditorComponent, ReviewPromptComponent,
    DecimalPipe
  ],
  template: `
    @if (store.wizardData(); as wizardData) {
      <div class="flex h-full gap-8">
        
        <!-- Sidebar / Stepper -->
        <div class="w-64 flex-shrink-0 flex flex-col border-r border-zinc-800 pr-6 py-2">
          <div class="space-y-1 flex-1">
            @for (step of store.steps; track step.key; let i = $index) {
              <button 
                (click)="store.goToStep(i)"
                class="w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all relative group"
                [class]="i === store.currentStepIndex() ? 'bg-zinc-900 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'"
              >
                <div class="flex items-center justify-between relative z-10">
                  <span>{{ step.label }}</span>
                </div>
                @if (i === store.currentStepIndex()) {
                  <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-l-lg"></div>
                }
              </button>
            }
          </div>

          <div class="pt-6 border-t border-zinc-800">
            <div class="text-xs text-zinc-500 mb-4 px-2">Completion: {{ store.progress() | number:'1.0-0' }}%</div>
            <div class="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
              <div class="h-full bg-indigo-500 transition-all duration-500" [style.width.%]="store.progress()"></div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 flex flex-col h-full py-2">
          <div class="flex-1 min-h-0 mb-6">
            @switch (store.currentStep().key) {
              @case ('idea') {
                <app-step-input [label]="store.currentStep().label" [description]="store.currentStep().description" [value]="wizardData.idea.prompt"
                  (valueChange)="updateSimpleStep('idea', $event)" />
              }
              @case ('characters') { <app-character-editor /> }
              @case ('setting') { 
                <app-step-input [label]="store.currentStep().label" [description]="store.currentStep().description" [value]="wizardData.setting.prompt"
                  (valueChange)="updateSimpleStep('setting', $event)" />
              }
              @case ('tone') { <app-style-editor /> }
              @case ('plot') { <app-plot-editor /> }
              @case ('visuals') { <app-visuals-editor /> }
              @case ('storyboard') { <app-storyboard-editor /> }
              @case ('review') { <app-review-prompt /> }
            }
          </div>

          <!-- Navigation Footer -->
          <div class="flex items-center justify-between pt-6 border-t border-zinc-800">
            <button (click)="store.prevStep()" [disabled]="store.currentStepIndex() === 0"
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 disabled:opacity-50 transition-colors">
              <icon-chevron-left class="w-4 h-4" /> Previous
            </button>

            @if (store.currentStepIndex() === store.steps.length - 1) {
              <button (click)="generate()" [disabled]="!store.canGenerate()"
                class="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-indigo-900/20 transition-all disabled:opacity-50">
                <icon-book class="w-4 h-4" /> Generate Story
              </button>
            } @else {
              <button (click)="store.nextStep()"
                class="flex items-center gap-2 px-6 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-sm font-medium shadow-lg transition-all">
                Next <icon-chevron-right class="w-4 h-4" />
              </button>
            }
          </div>
        </div>

      </div>
    } @else {
      <div class="flex items-center justify-center h-full text-zinc-500">
        <p>No active project selected.</p>
      </div>
    }
  `
})
export class WizardComponent {
  store = inject(StoreService);

  updateSimpleStep(key: 'idea' | 'setting', value: string) {
    this.store.updateProject(p => ({
      ...p,
      wizardData: { ...p.wizardData, [key]: { prompt: value } }
    }));
  }

  generate() {
    this.store.startStoryGeneration();
  }
}

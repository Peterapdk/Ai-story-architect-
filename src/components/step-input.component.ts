

import { Component, input, Output, EventEmitter, inject, signal, effect, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { IconSparkles, IconUndo, IconRedo, IconLoader, IconPlus, IconAlert } from './icons';
import { MarkdownRendererComponent } from './markdown-renderer.component';

@Component({
  selector: 'app-step-input',
  standalone: true,
  imports: [FormsModule, IconSparkles, IconUndo, IconRedo, IconLoader, IconPlus, IconAlert, MarkdownRendererComponent],
  template: `
    <div class="flex flex-col gap-4 h-full">
      
      <!-- Header Area -->
      <div class="flex items-center justify-between flex-shrink-0">
        <div class="space-y-1">
          <h2 class="text-2xl font-bold text-zinc-100 tracking-tight">{{ label() }}</h2>
          <p class="text-sm text-zinc-400">{{ description() }}</p>
        </div>
      </div>

      <div class="flex-1 flex flex-col gap-4 min-h-0">
        <!-- Preview Area (Conditional) -->
        @if (internalValue().length > 0) {
          <div class="flex-shrink-0 max-h-[30%] overflow-y-auto p-4 rounded-xl border border-zinc-800 bg-zinc-900 custom-scrollbar shadow-inner">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded">Preview</span>
            </div>
            <app-markdown-renderer [content]="internalValue()" />
          </div>
        }

        <!-- Input Area -->
        <div class="relative flex-1 group min-h-0 transition-opacity" [class.opacity-70]="isRefining()">
          <div [class]="glowClasses()"></div>
          <textarea 
            [ngModel]="internalValue()"
            (ngModelChange)="onValueChange($event)"
            [placeholder]="currentPlaceholder()"
            [disabled]="isRefining()"
            class="relative w-full h-full bg-zinc-950 text-zinc-100 rounded-xl border border-zinc-800 p-6 focus:outline-none focus:ring-0 resize-none font-mono text-sm leading-relaxed placeholder-zinc-600 disabled:cursor-not-allowed"
          ></textarea>
          
          <!-- Floating Action Bar -->
          <div class="absolute bottom-4 right-4 z-20">
            
            <!-- Error Toast -->
            @if (errorMessage()) {
              <div class="absolute bottom-full right-0 mb-4 w-64 bg-red-950/90 border border-red-800/50 text-red-200 text-xs px-3 py-2.5 rounded-lg flex items-start gap-2 shadow-xl backdrop-blur-md fade-in-up">
                <icon-alert class="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <div class="flex items-center gap-2">
              <!-- Undo Button -->
              @if (history().length > 0) {
                 <button 
                  (click)="undo()"
                  [disabled]="isRefining()"
                  class="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-100 hover:border-zinc-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Undo last AI refinement"
                >
                  <icon-undo class="w-4 h-4" />
                </button>
              }
              
              <!-- Redo Button -->
              @if (redoStack().length > 0) {
                 <button 
                  (click)="redo()"
                  [disabled]="isRefining()"
                  class="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-100 hover:border-zinc-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Redo reverted change"
                >
                  <icon-redo class="w-4 h-4" />
                </button>
              }
             
              <!-- Main Control Group -->
              <div class="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg">
                
                <!-- Suggestions Flyout Menu -->
                <div 
                  class="absolute bottom-full right-0 mb-3 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 p-2 rounded-xl shadow-2xl flex flex-col gap-1 min-w-[200px] origin-bottom-right transition-all duration-200"
                  [class.opacity-0]="!showSuggestions()"
                  [class.invisible]="!showSuggestions()"
                  [class.scale-95]="!showSuggestions()"
                  [class.translate-y-2]="!showSuggestions()"
                  [class.opacity-100]="showSuggestions()"
                  [class.visible]="showSuggestions()"
                  [class.scale-100]="showSuggestions()"
                  [class.translate-y-0]="showSuggestions()"
                >
                  <div class="px-2 py-1.5 flex justify-between items-center border-b border-zinc-800/50 mb-1">
                    <span class="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Quick Suggestions</span>
                  </div>
                  @for (suggestion of currentSuggestions(); track $index) {
                    <button 
                      (click)="applySuggestion(suggestion)"
                      class="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-indigo-500/20 hover:text-indigo-200 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <icon-plus class="w-3 h-3 opacity-50" />
                      {{ suggestion }}
                    </button>
                  }
                </div>

                <!-- Suggestions Trigger -->
                <button 
                  (click)="toggleSuggestions()"
                  class="p-2.5 border-r border-zinc-800 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800/50 transition-colors rounded-l-lg"
                  [class.text-indigo-400]="showSuggestions()"
                  [class.bg-zinc-800]="showSuggestions()"
                  title="AI Suggestions"
                >
                  <icon-plus class="w-4 h-4 transition-transform duration-300" [class.rotate-45]="showSuggestions()" />
                </button>

                <!-- Manual Input -->
                <input 
                  type="text" 
                  [(ngModel)]="refineInstruction"
                  placeholder="e.g. Make it darker..."
                  class="bg-transparent border-none text-xs text-zinc-200 p-2.5 w-32 focus:outline-none focus:w-48 transition-all placeholder-zinc-600"
                  (keyup.enter)="refine()"
                />

                <!-- Refine Button -->
                <button 
                  (click)="refine()"
                  [disabled]="isRefining()"
                  class="p-2.5 bg-zinc-100 text-zinc-950 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 font-medium text-xs px-3 rounded-r-lg"
                >
                  @if (isRefining()) {
                    <icon-loader class="w-3 h-3 animate-spin" />
                    Refining...
                  } @else {
                    <icon-sparkles class="w-3 h-3" />
                    Refine
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StepInputComponent {
  label = input.required<string>();
  description = input.required<string>();
  value = input.required<string>();
  
  @Output() valueChange = new EventEmitter<string>();

  private gemini = inject(GeminiService);
  
  internalValue = signal('');
  history = signal<string[]>([]);
  redoStack = signal<string[]>([]);
  
  isRefining = signal(false);
  showSuggestions = signal(false);
  errorMessage = signal('');
  refineInstruction = '';

  glowClasses = computed(() => {
    const base = 'absolute -inset-0.5 bg-gradient-to-r rounded-xl transition-all duration-500';
    if (this.isRefining()) {
      // Classes for the pulsing glow effect when AI is working
      return `${base} from-indigo-500 to-purple-500 opacity-75 pulse-glow`;
    }
    // Original classes for default, hover, and focus states
    return `${base} from-zinc-800 to-zinc-800 opacity-50 group-hover:opacity-100 blur group-focus-within:from-indigo-500 group-focus-within:to-purple-500 group-focus-within:opacity-75`;
  });

  // Suggestions based on the current step label
  suggestionMap: Record<string, string[]> = {
    'Characters': ['Expand description', 'Improve complexity', 'Deepen motivations', 'Add physical flaws', 'Give them a secret', 'Describe clothing', 'Create conflict'],
    'Setting': ['Describe sensory details', 'Add historical context', 'Describe the lighting', 'Add weather effects'],
    'Core Idea': ['Raise the stakes', 'Add a twist', 'Simplify the concept', 'Make it mysterious'],
    'Tone & Style': ['Make it darker', 'Make it hopeful', 'Use more metaphors', 'Make it fast-paced'],
    'Plot Points': ['Improve flow & pacing', 'Add a cliffhanger', 'Increase tension', 'Create a dilemma', 'Add a subplot'],
    'Visual Style': ['Focus on colors', 'Cinematic framing', 'Dreamlike imagery', 'Gritty realism']
  };

  // Example placeholders to guide the user
  placeholderMap: Record<string, string> = {
    'Core Idea': `Describe the central premise. What is the main conflict?\n\nExample: In a world where sleep is obsolete, a young dreamer discovers they can still dream, and that their dreams are altering reality. The government's Thought Police are hunting them down to control this power.`,
    
    'Characters': `Name: Silas Vane
Role: Protagonist
Description: A rugged data-courier with a cybernetic eye that sees ghosts in the machine.
### Motivations
He wants to clear his debt to the syndicate and escape the city, but his sister is being held collateral.

Name: The Architect
Role: Antagonist
Description: An AI that believes it is a god.`,

    'Setting': `Describe the world, time period, and atmosphere.\n\nExample: Neo-Veridia, 2150. A solar-punk utopia built on the ruins of old New York. Giant trees grow through skyscrapers. The air is clean but silent. It is a post-scarcity society masking a dark secret beneath the roots.`,

    'Tone & Style': `Define the mood, narrative voice, and pacing.\n\nExample: \n- Genre: Cyber-Noir\n- Mood: Melancholic, rainy, neon-soaked.\n- Voice: First-person, cynical but poetic.\n- Pacing: Slow burn mystery exploding into high-octane action.`,

    'Plot Points': `Outline key events:

- Inciting Incident: Silas intercepts a data packet he wasn't meant to see.
- Rising Action: He is hunted by the Architect's drones. He meets a resistance group living in the sewers.
- Climax: The upload at the Spire while the city burns.
- Resolution: Silas sacrifices his memory to free the AI's prisoners.

### Potential Twists
- The resistance leader is actually a sub-routine of the Architect.
- The data packet contains Silas's own deleted memories.`,

    'Visual Style': `Describe the visual language, colors, and imagery.\n\nExample: \n- Palette: Deep purples, electric blues, and rain-slicked black.\n- Lighting: Neon signs reflecting in puddles, stark silhouettes.\n- Texture: Gritty, digital distortion, wet pavement.\n- Camera: Handheld during chases, wide static shots for the cityscapes.`
  };

  currentSuggestions = computed(() => {
    return this.suggestionMap[this.label()] || ['Improve clarity', 'Expand details', 'Fix grammar'];
  });

  currentPlaceholder = computed(() => {
    return this.placeholderMap[this.label()] || `Enter details about ${this.label().toLowerCase()}...`;
  });

  constructor() {
    // Sync internal state with parent's value if it changes externally (e.g. step navigation)
    effect(() => {
      this.internalValue.set(this.value());
    }, { allowSignalWrites: true });
  }

  onValueChange(newValue: string) {
    this.internalValue.set(newValue);
    this.valueChange.emit(newValue);
    
    // If user types manually, the redo future is invalid because history has diverged
    if (this.redoStack().length > 0) {
      this.redoStack.set([]);
    }
  }

  toggleSuggestions() {
    this.showSuggestions.update(v => !v);
  }

  applySuggestion(text: string) {
    this.refineInstruction = text;
    this.showSuggestions.set(false);
    this.refine();
  }

  async refine() {
    const currentVal = this.internalValue();
    if (!currentVal.trim() || this.isRefining()) return;

    this.isRefining.set(true);
    this.errorMessage.set('');
    
    // Save current state to history
    this.history.update(h => [...h, currentVal]);
    // New action clears redo stack
    this.redoStack.set([]);

    try {
      const refined = await this.gemini.refineText(currentVal, this.label(), this.refineInstruction);
      this.internalValue.set(refined);
      this.valueChange.emit(refined);
      this.refineInstruction = ''; 
    } catch (e: any) {
      this.errorMessage.set(e.message || 'Failed to refine text');
      setTimeout(() => this.errorMessage.set(''), 6000);
    } finally {
      this.isRefining.set(false);
    }
  }

  undo() {
    const currentHistory = this.history();
    if (currentHistory.length === 0) return;

    const currentVal = this.internalValue();
    // Revert to the last saved state
    const previousValue = currentHistory[currentHistory.length - 1];
    
    // Save the "future" state (current) to redo stack
    this.redoStack.update(r => [...r, currentVal]);

    this.internalValue.set(previousValue);
    this.valueChange.emit(previousValue);
    
    // Remove the state we just restored from history
    this.history.update(h => h.slice(0, -1));
  }

  redo() {
    const currentRedo = this.redoStack();
    if (currentRedo.length === 0) return;

    const currentVal = this.internalValue();
    // Get the value we want to return to (top of the stack)
    const nextValue = currentRedo[currentRedo.length - 1];

    // Save the "past" state (current value before redo) back to history
    this.history.update(h => [...h, currentVal]);

    this.internalValue.set(nextValue);
    this.valueChange.emit(nextValue);

    // Remove the state we just restored from redo stack
    this.redoStack.update(r => r.slice(0, -1));
  }
}
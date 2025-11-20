
import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../services/store.service';
import { GeminiService } from '../services/gemini.service';
import { Character } from '../services/persistence.service';
import { IconPlus, IconSparkles, IconTrash, IconLoader } from './icons';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-character-editor',
  standalone: true,
  imports: [FormsModule, IconPlus, IconSparkles, IconTrash, IconLoader, NgTemplateOutlet],
  template: `
    <div class="flex flex-col h-full">
        <div class="flex-shrink-0 mb-6">
          <h2 class="text-2xl font-bold text-zinc-100 tracking-tight">Characters</h2>
          <p class="text-sm text-zinc-400">Define the key players in your story. Add protagonists, antagonists, and supporting roles.</p>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar pr-4 -mr-4 space-y-6">
            @for (character of characters(); track character.id) {
                <div class="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl relative group">
                    <button (click)="removeCharacter(character.id)" class="absolute top-4 right-4 p-1.5 bg-zinc-800/50 text-zinc-500 hover:bg-red-500/20 hover:text-red-400 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <icon-trash class="w-4 h-4" />
                    </button>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Name & Description -->
                        <div class="space-y-4">
                            <ng-container [ngTemplateOutlet]="refinableInput" [ngTemplateOutletContext]="{ label: 'Name', field: 'name', character: character, isTextarea: false }"></ng-container>
                            <ng-container [ngTemplateOutlet]="refinableInput" [ngTemplateOutletContext]="{ label: 'Description', field: 'description', character: character, isTextarea: true }"></ng-container>
                        </div>
                        <!-- Motivation -->
                        <div class="space-y-4">
                             <ng-container [ngTemplateOutlet]="refinableInput" [ngTemplateOutletContext]="{ label: 'Core Motivation', field: 'motivation', character: character, isTextarea: true }"></ng-container>
                        </div>
                    </div>
                </div>
            }

             <button (click)="addCharacter()" class="w-full flex items-center justify-center gap-2 text-zinc-400 border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 hover:text-indigo-300 rounded-xl p-6 transition-colors">
                <icon-plus class="w-5 h-5" />
                Add New Character
            </button>
        </div>
    </div>

    <!-- Reusable Input Component -->
    <ng-template #refinableInput let-label="label" let-field="field" let-character="character" let-isTextarea="isTextarea">
       <div>
            <label class="text-sm font-medium text-zinc-300 block mb-2">{{ label }}</label>
            <div class="relative">
                @if (isTextarea) {
                    <textarea [value]="character[field]" (input)="updateCharacterField(character.id, field, $event.target.value)" 
                    class="w-full h-32 bg-zinc-950 text-zinc-100 rounded-xl border border-zinc-800 p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-mono text-sm"
                    ></textarea>
                } @else {
                    <input type="text" [value]="character[field]" (input)="updateCharacterField(character.id, field, $event.target.value)"
                     class="w-full bg-zinc-950 text-zinc-100 rounded-xl border border-zinc-800 p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
                    />
                }
                 <button (click)="refineField(character, field)" 
                    [disabled]="refiningState()[character.id + field]"
                    class="absolute bottom-2 right-2 p-1.5 bg-zinc-800 text-zinc-400 hover:text-indigo-300 rounded-md transition-colors disabled:opacity-50">
                    @if(refiningState()[character.id + field]) {
                        <icon-loader class="w-3.5 h-3.5 animate-spin" />
                    } @else {
                        <icon-sparkles class="w-3.5 h-3.5" />
                    }
                 </button>
            </div>
        </div>
    </ng-template>
  `
})
export class CharacterEditorComponent {
  store = inject(StoreService);
  gemini = inject(GeminiService);
  
  characters = computed(() => this.store.wizardData()?.characters || []);
  refiningState = signal<Record<string, boolean>>({});

  addCharacter() {
    const newChar: Character = {
      id: `char_${Date.now()}`,
      name: 'New Character',
      description: '',
      motivation: ''
    };
    this.store.updateProject(p => ({
      ...p,
      wizardData: { ...p.wizardData, characters: [...p.wizardData.characters, newChar] }
    }));
  }
  
  removeCharacter(id: string) {
    this.store.updateProject(p => ({
      ...p,
      wizardData: { ...p.wizardData, characters: p.wizardData.characters.filter(c => c.id !== id) }
    }));
  }

  updateCharacterField(id: string, field: keyof Omit<Character, 'id'>, value: string) {
    this.store.updateProject(p => ({
      ...p,
      wizardData: {
        ...p.wizardData,
        characters: p.wizardData.characters.map(c => c.id === id ? { ...c, [field]: value } : c)
      }
    }));
  }

  async refineField(character: Character, field: keyof Omit<Character, 'id'>) {
    const stateKey = character.id + field;
    this.refiningState.update(s => ({ ...s, [stateKey]: true }));
    
    try {
      const currentText = character[field];
      const context = `Refining the '${field}' of a character named '${character.name}'.`;
      const refinedText = await this.gemini.refineText(currentText, context);
      this.updateCharacterField(character.id, field, refinedText);
    } catch (e) {
      console.error(`Failed to refine ${field}`, e);
    } finally {
      this.refiningState.update(s => ({ ...s, [stateKey]: false }));
    }
  }
}


import { Component, inject, signal, computed, viewChild, ElementRef, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../services/store.service';
import { GeminiService } from '../services/gemini.service';
import { Character, ChatMessage } from '../services/persistence.service';
import { IconLoader, IconMessageSquare, IconArrowUp } from './icons';
import { MarkdownRendererComponent } from './markdown-renderer.component';

@Component({
  selector: 'app-character-chat',
  standalone: true,
  imports: [FormsModule, IconLoader, IconMessageSquare, MarkdownRendererComponent, IconArrowUp],
  template: `
    <div class="flex h-full gap-8">
        <!-- Left Side: Character Selection -->
        <div class="w-72 flex-shrink-0 flex flex-col border-r border-zinc-800 pr-6">
            <div class="flex-shrink-0 mb-4">
                <h2 class="text-2xl font-bold text-zinc-100 tracking-tight">Character Chat</h2>
                <p class="text-sm text-zinc-400">"Interview" your characters to discover their voice.</p>
            </div>
            <div class="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2 space-y-2">
                @for (character of characters(); track character.id) {
                    <button 
                        (click)="selectCharacter(character.id)"
                        class="w-full text-left p-3 rounded-lg transition-colors"
                        [class]="character.id === selectedCharacter()?.id ? 'bg-indigo-500/10' : 'hover:bg-zinc-800/50'">
                        <p class="font-medium text-zinc-100">{{ character.name }}</p>
                        <p class="text-xs text-zinc-400 line-clamp-2">{{ character.description }}</p>
                    </button>
                }
            </div>
        </div>

        <!-- Right Side: Chat Interface -->
        <div class="flex-1 flex flex-col">
            @if (selectedCharacter(); as character) {
                <div class="flex-1 flex flex-col min-h-0">
                    <!-- Chat History -->
                    <div #chatHistoryContainer class="flex-1 overflow-y-auto custom-scrollbar mb-4 pr-2 -mr-2 space-y-6">
                        @for (message of chatHistory(); track $index) {
                            <div class="flex gap-4" [class.flex-row-reverse]="message.role === 'user'">
                                <img [src]="message.role === 'user' ? userAvatar() : 'https://i.pravatar.cc/150?u=' + character.id" alt="avatar" class="w-8 h-8 rounded-full"/>
                                <div class="max-w-xl p-4 rounded-xl"
                                    [class]="message.role === 'user' ? 'bg-indigo-500/10' : 'bg-zinc-800/50'">
                                    <app-markdown-renderer [content]="message.content" />
                                </div>
                            </div>
                        }
                    </div>

                    <!-- Chat Input -->
                    <div class="flex-shrink-0 relative">
                        <textarea 
                            [(ngModel)]="userInput"
                            (keydown.enter)="sendMessage($event)"
                            placeholder="Ask {{ character.name }} a question..."
                            class="w-full h-24 bg-zinc-900 text-zinc-100 rounded-xl border border-zinc-800 p-4 pr-12 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-mono text-sm"
                            [disabled]="isStreaming()"
                        ></textarea>
                        <button (click)="sendMessage()" [disabled]="isStreaming() || !userInput.trim()"
                            class="absolute bottom-3 right-3 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50">
                            @if(isStreaming()) {
                                <icon-loader class="w-5 h-5 animate-spin"/>
                            } @else {
                                <icon-arrow-up class="w-5 h-5" />
                            }
                        </button>
                    </div>
                </div>
            } @else {
                <div class="flex-1 flex flex-col items-center justify-center text-zinc-600">
                    <icon-message-square class="w-12 h-12 mb-4"/>
                    <p>Select a character to begin a conversation.</p>
                </div>
            }
        </div>
    </div>
  `
})
export class CharacterChatComponent {
  store = inject(StoreService);
  gemini = inject(GeminiService);
  
  characters = computed(() => this.store.wizardData()?.characters || []);
  selectedCharacter = computed(() => this.characters().find(c => c.id === this.store.selectedChatCharacterId()));
  chatHistory = computed(() => this.store.chatHistory());
  userAvatar = computed(() => this.store.user()?.avatarUrl || '');
  
  userInput = '';
  isStreaming = signal(false);

  chatHistoryContainer = viewChild<ElementRef<HTMLDivElement>>('chatHistoryContainer');

  constructor() {
    // Auto-select first character if none is selected
    effect(() => {
      if (!this.selectedCharacter() && this.characters().length > 0) {
        this.store.selectCharacterForChat(this.characters()[0].id);
      }
    }, { allowSignalWrites: true }); 
    
    // Auto-scroll chat
    effect(() => {
      if (this.chatHistory().length) {
        this.scrollToBottom();
      }
    }, { allowSignalWrites: true });
  }
  
  selectCharacter(id: string) {
    this.store.selectCharacterForChat(id);
  }
  
  async sendMessage(event?: KeyboardEvent) {
    if (event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
      } else {
        return;
      }
    }

    const message = this.userInput.trim();
    const character = this.selectedCharacter();
    if (!message || !character || this.isStreaming()) return;

    this.isStreaming.set(true);
    this.store.addChatMessage({ role: 'user', content: message });
    this.userInput = '';
    
    // Add an empty model message to stream into
    this.store.addChatMessage({ role: 'model', content: '' });
    
    try {
      const history = this.chatHistory().slice(0, -2) // Exclude the user's latest message and our empty one
          .reduce((acc, msg, i) => {
              if (i % 2 === 0) {
                if (msg.role === 'user') {
                  acc.push({ user: msg.content, model: '' });
                }
              } else {
                if (msg.role === 'model' && acc.length > 0) {
                  acc[acc.length - 1].model = msg.content;
                }
              }
              return acc;
          }, [] as { user: string; model: string }[]);
      
      const stream = this.gemini.generateCharacterResponseStream(character, history, message);
      for await (const chunk of stream) {
        this.store.updateLastChatMessage(m => ({ ...m, content: m.content + chunk }));
      }
    } catch(e) {
      console.error("Chat failed", e);
      this.store.updateLastChatMessage(m => ({...m, content: `**(OOC: I'm sorry, an error occurred.)**`}));
    } finally {
      this.isStreaming.set(false);
    }
  }
  
  scrollToBottom() {
    setTimeout(() => {
      const el = this.chatHistoryContainer()?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, 0);
  }
}

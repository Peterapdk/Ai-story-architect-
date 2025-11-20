
import { Component, inject, signal, computed, effect, viewChild, ElementRef, HostListener } from '@angular/core';
import { StoreService } from '../services/store.service';
import { IconPlus, IconTrash, IconBook, IconFolder, IconFolderPlus, IconMoreVertical } from './icons';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Project } from '../services/persistence.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [IconPlus, IconTrash, IconBook, DatePipe, FormsModule, IconFolder, IconFolderPlus, IconMoreVertical],
  template: `
    <div class="flex-1 flex gap-8 overflow-hidden">
      <!-- Sidebar for Folders -->
      <div class="w-64 flex-shrink-0 flex flex-col border-r border-zinc-800/50 pr-6">
        <div class="flex-1 flex flex-col gap-1 py-6">
          <button (click)="selectedFolderId.set(null)" class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium" [class]="!selectedFolderId() ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'">All Stories</button>
          <button (click)="selectedFolderId.set('uncategorized')" class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium" [class]="selectedFolderId() === 'uncategorized' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'">Uncategorized</button>
          <div class="h-px bg-zinc-800 my-2"></div>
          @for (folder of store.folders(); track folder.id) {
            <button (click)="selectedFolderId.set(folder.id)" class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2" [class]="selectedFolderId() === folder.id ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'">
              <icon-folder class="w-4 h-4" />
              <span class="flex-1 truncate">{{ folder.name }}</span>
            </button>
          }
        </div>
        @if (isCreatingFolder()) {
            <div class="flex-shrink-0">
                <input type="text" #folderInput [(ngModel)]="newFolderName" (keyup.enter)="confirmCreateFolder()" (keyup.escape)="cancelCreateFolder()" placeholder="New folder name..."
                    class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"/>
                <div class="flex justify-end gap-2 mt-2">
                    <button (click)="cancelCreateFolder()" class="text-xs px-2 py-1 hover:bg-zinc-800 rounded">Cancel</button>
                    <button (click)="confirmCreateFolder()" class="text-xs px-2 py-1 bg-indigo-600 text-white rounded">Create</button>
                </div>
            </div>
        } @else {
            <button (click)="startCreateFolder()" class="w-full flex-shrink-0 flex items-center gap-2 text-zinc-400 hover:text-indigo-300 p-2 rounded-lg transition-colors">
                <icon-folder-plus class="w-4 h-4" />
                <span class="text-sm">New Folder</span>
            </button>
        }
      </div>
    
      <!-- Main Content Grid -->
      <div class="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        <div class="pt-6 pb-8">
          <h1 class="text-3xl font-bold tracking-tight text-zinc-100">Welcome back!</h1>
          <p class="text-zinc-400">Choose a story to continue, or start a new masterpiece.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          @if(isCreatingProject()) {
            <div class="group flex flex-col aspect-[4/3] bg-zinc-900 border-2 border-dashed border-indigo-500 rounded-xl p-6 space-y-3 fade-in-up">
                <h2 class="font-bold text-zinc-100 mb-2">New Story</h2>
                <input #titleInput type="text" [(ngModel)]="newProjectTitle" (keyup.enter)="confirmCreateProject()" (keyup.escape)="cancelCreateProject()" placeholder="Enter story title..." class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                <div class="flex-grow"></div>
                <div class="flex justify-end gap-2">
                    <button (click)="cancelCreateProject()" class="text-xs px-3 py-1.5 hover:bg-zinc-800 rounded">Cancel</button>
                    <button (click)="confirmCreateProject()" [disabled]="!newProjectTitle.trim()" class="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded disabled:opacity-50">Create</button>
                </div>
            </div>
          } @else {
            <button (click)="startCreateProject()" class="group flex flex-col items-center justify-center aspect-[4/3] bg-zinc-900/50 border-2 border-dashed border-zinc-800 hover:border-indigo-500 hover:bg-indigo-950/30 rounded-xl transition-all p-6">
              <div class="w-16 h-16 bg-zinc-800 group-hover:bg-indigo-500/20 flex items-center justify-center rounded-full transition-colors mb-4">
                <icon-plus class="w-8 h-8 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
              </div>
              <h2 class="font-bold text-zinc-100">Create New Story</h2>
            </button>
          }
          
          @for (project of filteredProjects(); track project.id) {
            <div class="group relative flex flex-col aspect-[4/3] bg-zinc-900 border border-zinc-800 rounded-xl transition-all p-6 overflow-hidden cursor-pointer hover:border-indigo-500/50 hover:bg-zinc-850/50" (click)="store.selectProject(project.id)">
              <div class="flex-1">
                <h3 class="font-bold text-zinc-100 leading-tight mb-2">{{ project.title }}</h3>
                <p class="text-xs text-zinc-500">
                  Last modified: {{ project.lastModified | date:'short' }}
                </p>
              </div>
              <div class="text-right">
                <span class="text-xs font-medium bg-zinc-800/80 text-zinc-300 px-2 py-1 rounded-md">
                  {{ project.generatedStory ? 'Draft' : 'Prompt' }}
                </span>
              </div>
              <div class="absolute top-3 right-3">
                <button (click)="toggleContextMenu(project.id, $event)" class="p-1.5 bg-zinc-800/50 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-200 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <icon-more-vertical class="w-4 h-4" />
                </button>
                @if (contextMenuOpen() === project.id) {
                    <div class="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-50 py-1.5">
                        <div class="px-3 py-1.5 text-xs text-zinc-500 border-b border-zinc-800">Move to...</div>
                        <button (click)="moveProject(project.id, null, $event)" class="w-full text-left text-sm px-3 py-1.5 hover:bg-zinc-800">Uncategorized</button>
                        @for(folder of store.folders(); track folder.id) {
                           <button (click)="moveProject(project.id, folder.id, $event)" class="w-full text-left text-sm px-3 py-1.5 hover:bg-zinc-800">{{ folder.name }}</button>
                        }
                         <div class="h-px bg-zinc-800 my-1"></div>
                         <button (click)="deleteProject(project.id, $event)" class="w-full text-left text-sm px-3 py-1.5 text-red-400 hover:bg-red-500/10">Delete Project</button>
                    </div>
                }
              </div>
            </div>
          }
        </div>
        @if (filteredProjects().length === 0 && !isCreatingProject()) {
            <div class="text-center py-16 text-zinc-600">
              <icon-book class="w-12 h-12 mx-auto mb-4" />
              <p>No stories in this folder.</p>
            </div>
        }
      </div>
    </div>
  `
})
export class DashboardComponent {
  store = inject(StoreService);
  selectedFolderId = signal<string | null>(null);
  
  isCreatingFolder = signal(false);
  newFolderName = '';
  
  isCreatingProject = signal(false);
  newProjectTitle = '';
  
  contextMenuOpen = signal<string | null>(null);
  titleInput = viewChild<ElementRef<HTMLInputElement>>('titleInput');

  filteredProjects = computed(() => {
    const folderId = this.selectedFolderId();
    const projects = this.store.projects();
    if (folderId === null) return projects;
    if (folderId === 'uncategorized') return projects.filter(p => !p.folderId);
    return projects.filter(p => p.folderId === folderId);
  });

  @HostListener('document:click')
  onGlobalClick() {
    if (this.contextMenuOpen()) {
      this.contextMenuOpen.set(null);
    }
  }
  
  startCreateFolder() {
    this.isCreatingFolder.set(true);
  }

  cancelCreateFolder() {
    this.isCreatingFolder.set(false);
    this.newFolderName = '';
  }

  confirmCreateFolder() {
    if (this.newFolderName.trim()) {
      this.store.createFolder(this.newFolderName.trim());
      this.cancelCreateFolder();
    }
  }

  startCreateProject() {
    this.isCreatingProject.set(true);
    setTimeout(() => this.titleInput()?.nativeElement.focus(), 0);
  }

  cancelCreateProject() {
    this.isCreatingProject.set(false);
    this.newProjectTitle = '';
  }

  confirmCreateProject() {
    if (this.newProjectTitle.trim()) {
      this.store.createNewProject(this.newProjectTitle.trim());
      this.cancelCreateProject();
    }
  }
  
  toggleContextMenu(id: string, event: MouseEvent) {
    event.stopPropagation();
    this.contextMenuOpen.update(current => current === id ? null : id);
  }
  
  moveProject(projectId: string, folderId: string | null, event: MouseEvent) {
    event.stopPropagation();
    this.store.moveProjectToFolder(projectId, folderId);
    this.contextMenuOpen.set(null);
  }

  deleteProject(id: string, event: MouseEvent) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      this.store.deleteProject(id);
      this.contextMenuOpen.set(null);
    }
  }
}

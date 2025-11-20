
import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { PersistenceService, Project, WizardData, Scene, StoryboardShot, ChatMessage, Portfolio, Folder, Snapshot } from './persistence.service';
import { AuthService } from './auth.service';
import { Operation, GenerateVideosResponse } from '@google/genai';

export type WizardStepKey = keyof WizardData | 'storyboard' | 'review';
export type EditorView = 'wizard' | 'research' | 'lore' | 'story' | 'chat';
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
export type VideoGenerationStatus = 'idle' | 'generating' | 'done' | 'error';

@Injectable({ providedIn: 'root' })
export class StoreService {
  private persistence = inject(PersistenceService);
  private auth = inject(AuthService);

  // --- STATE ---
  appState = signal<'login' | 'dashboard' | 'editor'>('login');
  portfolio = signal<Portfolio>({ projects: [], folders: [] });
  activeProjectId = signal<string | null>(null);
  editorView = signal<EditorView>('wizard');
  saveStatus = signal<SaveStatus>('idle');
  private saveTimeout: any;
  
  // Character Chat State
  selectedChatCharacterId = signal<string | null>(null);
  
  // Video polling operations
  activeVideoOperations = signal<Map<string, Operation<GenerateVideosResponse>>>(new Map());

  // --- DERIVED STATE (COMPUTED) ---
  user = computed(() => this.auth.user());
  projects = computed(() => this.portfolio().projects);
  folders = computed(() => this.portfolio().folders);
  
  activeProject = computed<Project | null>(() => this.projects().find(p => p.id === this.activeProjectId()) ?? null);
  
  wizardData = computed(() => this.activeProject()?.wizardData);
  
  canGenerate = computed(() => (this.wizardData()?.idea.prompt || '').length > 10);
  
  chatHistory = computed(() => {
    const charId = this.selectedChatCharacterId();
    if (!charId) return [];
    return this.activeProject()?.chatHistory?.[charId] || [];
  });

  steps: { key: WizardStepKey; label: string; description: string }[] = [
    { key: 'idea', label: 'Core Idea', description: 'The elevator pitch or central concept.' },
    { key: 'characters', label: 'Characters', description: 'Protagonists, antagonists, and their motivations.' },
    { key: 'setting', label: 'Setting', description: 'World building, time period, and location.' },
    { key: 'tone', label: 'Tone & Style', description: 'Mood, voice, and narrative perspective.' },
    { key: 'plot', label: 'Plot Points', description: 'Key events, twists, and the climax.' },
    { key: 'visuals', label: 'Visual Style', description: 'Imagery, colors, and sensory details.' },
    { key: 'storyboard', label: 'Storyboard', description: 'Key cinematic shots for your story.' },
    { key: 'review', label: 'Review & Refine', description: 'Final AI analysis of your prompt.' }
  ];
  currentStepIndex = signal(0);
  currentStep = computed(() => this.steps[this.currentStepIndex()]);
  progress = computed(() => ((this.currentStepIndex() + 1) / this.steps.length) * 100);

  constructor() {
    effect(() => {
      this.auth.isAuthenticated() ? this.onLogin() : this.onLogout();
    }, { allowSignalWrites: true });

    effect(() => {
      // Auto-save the entire portfolio when it changes
      const currentPortfolio = this.portfolio();
      if (currentPortfolio.projects.length > 0 || currentPortfolio.folders.length > 0) {
        this.debouncedSave();
      }
    });
  }
  
  private onLogin() {
    this.portfolio.set(this.persistence.loadPortfolio());
    this.appState.set('dashboard');
  }

  private onLogout() {
    this.appState.set('login');
    this.portfolio.set({ projects: [], folders: [] });
    this.activeProjectId.set(null);
  }

  // --- ACTIONS ---

  // Project Management
  createNewProject(title: string) {
    if (!title || !title.trim()) return;
    const newProject: Project = this.persistence.createNewProject(title.trim());
    this.portfolio.update(p => ({ ...p, projects: [newProject, ...p.projects] }));
    this.selectProject(newProject.id);
  }

  selectProject(id: string) {
    this.activeProjectId.set(id);
    this.currentStepIndex.set(0);
    this.editorView.set('wizard');
    this.appState.set('editor');
  }

  deleteProject(id: string) {
    this.portfolio.update(p => ({ ...p, projects: p.projects.filter(proj => proj.id !== id) }));
    if (this.activeProjectId() === id) this.exitEditor();
  }

  exitEditor() {
    this.manualSave(); // Ensure final changes are saved before exiting
    this.activeProjectId.set(null);
    this.appState.set('dashboard');
  }

  // Folder & Tag Management
  createFolder(name: string) {
    const newFolder: Folder = { id: `folder_${Date.now()}`, name };
    this.portfolio.update(p => ({ ...p, folders: [...p.folders, newFolder] }));
  }

  deleteFolder(id: string) {
    this.portfolio.update(p => ({
      folders: p.folders.filter(f => f.id !== id),
      projects: p.projects.map(proj => proj.folderId === id ? { ...proj, folderId: null } : proj)
    }));
  }

  moveProjectToFolder(projectId: string, folderId: string | null) {
    this.updateProjectById(projectId, p => ({ ...p, folderId }));
  }

  // Editor View
  setEditorView(view: EditorView) { this.editorView.set(view); }

  // Wizard Navigation
  nextStep() { if (this.currentStepIndex() < this.steps.length - 1) this.currentStepIndex.update(i => i + 1); }
  prevStep() { if (this.currentStepIndex() > 0) this.currentStepIndex.update(i => i - 1); } // <-- BUG FIX
  goToStep(index: number) { if (index >= 0 && index < this.steps.length) this.currentStepIndex.set(index); }
  
  // Data Updates & Saving
  private debouncedSave() {
    clearTimeout(this.saveTimeout);
    this.saveStatus.set('idle');
    this.saveTimeout = setTimeout(() => this.manualSave(), 1500);
  }

  manualSave() {
    clearTimeout(this.saveTimeout);
    this.saveStatus.set('saving');
    try {
      this.persistence.savePortfolio(this.portfolio());
      this.saveStatus.set('saved');
      setTimeout(() => { if (this.saveStatus() === 'saved') this.saveStatus.set('idle'); }, 2000);
    } catch (e) {
      console.error('Save failed:', e);
      this.saveStatus.set('error');
    }
  }

  private updateProjectById(id: string, updater: (project: Project) => Project) {
    this.portfolio.update(p => ({
      ...p,
      projects: p.projects.map(proj => proj.id === id ? { ...updater(proj), lastModified: new Date() } : proj)
    }));
  }

  updateProject(updater: (project: Project) => Project) {
    const id = this.activeProjectId();
    if (!id) return;
    this.updateProjectById(id, updater);
  }

  // Version History Actions
  createSnapshot(name: string) {
    const project = this.activeProject();
    if (!project) return;
    const newSnapshot: Snapshot = {
      id: `snap_${Date.now()}`,
      name,
      timestamp: new Date(),
      wizardData: JSON.parse(JSON.stringify(project.wizardData)), // Deep copy
      generatedScenes: JSON.parse(JSON.stringify(project.generatedScenes)) // Deep copy
    };
    this.updateProject(p => ({ ...p, history: [...p.history, newSnapshot] }));
  }

  restoreSnapshot(snapshotId: string) {
    const project = this.activeProject();
    const snapshot = project?.history.find(h => h.id === snapshotId);
    if (!project || !snapshot) return;

    this.updateProject(p => ({
      ...p,
      wizardData: JSON.parse(JSON.stringify(snapshot.wizardData)),
      generatedScenes: JSON.parse(JSON.stringify(snapshot.generatedScenes)),
      generatedStory: snapshot.generatedScenes.map(s => s.content).join('\n\n')
    }));
  }

  deleteSnapshot(snapshotId: string) {
    this.updateProject(p => ({ ...p, history: p.history.filter(h => h.id !== snapshotId) }));
  }

  // Consistency Checker Action
  async checkProjectConsistency(gemini: any) {
    const project = this.activeProject();
    if (!project) return;

    this.updateProject(p => ({ ...p, consistencyReport: { isChecking: true, report: '' } }));
    try {
      const report = await gemini.checkConsistency(project);
      this.updateProject(p => ({ ...p, consistencyReport: { isChecking: false, report } }));
    } catch (e) {
      this.updateProject(p => ({ ...p, consistencyReport: { isChecking: false, report: `Error: ${e.message}` } }));
    }
  }


  // Story Generation
  startStoryGeneration() {
    this.updateProject(p => ({ ...p, generatedStory: '', generatedScenes: [], viewMode: 'story' }));
    this.editorView.set('story');
  }

  setStory(fullStory: string) {
    const scenes = this.splitStoryIntoScenes(fullStory);
    this.updateProject(p => ({ ...p, generatedStory: fullStory, generatedScenes: scenes }));
  }

  // Video Generation
  addVideoOperation(id: string, operation: Operation<GenerateVideosResponse>) {
    this.activeVideoOperations.update(map => new Map(map).set(id, operation));
  }

  removeVideoOperation(id: string) {
    this.activeVideoOperations.update(map => {
      const newMap = new Map(map);
      newMap.delete(id);
      return newMap;
    });
  }

  updateScene(sceneId: string, updater: (scene: Scene) => Scene) {
    this.updateProject(p => ({
      ...p,
      generatedScenes: p.generatedScenes.map(s => s.id === sceneId ? updater(s) : s)
    }));
  }

  updateStoryboardShot(shotId: string, updater: (shot: StoryboardShot) => StoryboardShot) {
     this.updateProject(p => ({
        ...p,
        wizardData: {
           ...p.wizardData,
           storyboard: p.wizardData.storyboard.map(s => s.id === shotId ? updater(s) : s)
        }
     }));
  }
  
  // Chat Actions
  selectCharacterForChat(charId: string | null) {
    this.selectedChatCharacterId.set(charId);
  }
  
  addChatMessage(message: ChatMessage) {
    const charId = this.selectedChatCharacterId();
    if (!charId) return;
    
    this.updateProject(p => {
      const existingHistory = p.chatHistory?.[charId] || [];
      const newHistory = [...existingHistory, message];
      return { ...p, chatHistory: { ...p.chatHistory, [charId]: newHistory }};
    });
  }
  
  updateLastChatMessage(updater: (message: ChatMessage) => ChatMessage) {
    const charId = this.selectedChatCharacterId();
    if (!charId) return;
    
    this.updateProject(p => {
      const existingHistory = p.chatHistory?.[charId] || [];
      if (existingHistory.length === 0) return p;
      
      const lastMessage = existingHistory[existingHistory.length - 1];
      const updatedMessage = updater(lastMessage);
      const newHistory = [...existingHistory.slice(0, -1), updatedMessage];
      
      return { ...p, chatHistory: { ...p.chatHistory, [charId]: newHistory }};
    });
  }

  private splitStoryIntoScenes(story: string): Scene[] {
    // Split by markdown headers (## or #)
    const sceneRegex = /(?=^##? .*$)/m;
    return story.split(sceneRegex).filter(s => s.trim()).map((content, index) => ({
      id: `scene_${Date.now()}_${index}`,
      content: content.trim(),
      videoStatus: 'idle',
      videoUrl: ''
    }));
  }
}

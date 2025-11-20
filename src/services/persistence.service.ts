
import { Injectable } from '@angular/core';
import { VideoGenerationStatus } from './store.service';

// --- STRUCTURED DATA INTERFACES ---

export interface Character {
  id: string;
  name: string;
  description: string;
  motivation: string;
  imageUrl?: string; // For generated character art
}

export interface PlotPoint {
  id: string;
  title: string;
  description: string;
}

export interface StyleAnalysis {
  sourceText: string;
  analysis: string;
  isAnalyzing: boolean;
}

export interface Visuals {
  prompt: string;
  imageUrls: string[];
  isGenerating: boolean;
}

export interface StoryboardShot {
    id: string;
    description: string;
    videoStatus: VideoGenerationStatus;
    videoUrl: string;
}

export interface Scene {
    id: string;
    content: string;
    videoStatus: VideoGenerationStatus;
    videoUrl: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface Snapshot {
  id: string;
  name: string;
  timestamp: Date;
  wizardData: WizardData;
  generatedScenes: Scene[];
}

export interface ConsistencyReport {
  isChecking: boolean;
  report: string;
}

// Describes the structure of the data that defines a story prompt.
export interface WizardData {
  idea: { prompt: string };
  characters: Character[];
  setting: { prompt: string };
  tone: StyleAnalysis;
  plot: PlotPoint[];
  visuals: Visuals;
  storyboard: StoryboardShot[];
  review: {
      isAnalyzing: boolean;
      analysis: string;
      fullPrompt: string;
  };
}

// Represents a single creative project.
export interface Project {
  id: string;
  title: string;
  lastModified: Date;
  wizardData: WizardData;
  generatedStory: string;
  generatedScenes: Scene[];
  researchNotes: string;
  lore: string;
  chatHistory: Record<string, ChatMessage[]>;
  viewMode: 'wizard' | 'story';
  // New fields for organization
  folderId: string | null;
  tags: string[];
  // New fields for advanced features
  history: Snapshot[];
  consistencyReport: ConsistencyReport;
  aiDirectives?: string;
}

export interface Folder {
  id: string;
  name: string;
}

// Top-level object for persistence
export interface Portfolio {
  projects: Project[];
  folders: Folder[];
}


@Injectable({
  providedIn: 'root'
})
export class PersistenceService {
  private storageKey = 'story_architect_portfolio_v3';

  private getDefaultWizardData(): WizardData {
     return {
        idea: { prompt: '' },
        characters: [],
        setting: { prompt: '' },
        tone: { sourceText: '', analysis: '', isAnalyzing: false },
        plot: [],
        visuals: { prompt: '', imageUrls: [], isGenerating: false },
        storyboard: [],
        review: { isAnalyzing: false, analysis: '', fullPrompt: '' },
      };
  }
  
  createNewProject(title: string): Project {
    return {
      id: `proj_${Date.now()}`,
      title: title,
      lastModified: new Date(),
      wizardData: this.getDefaultWizardData(),
      generatedStory: '',
      generatedScenes: [],
      researchNotes: '',
      lore: '',
      chatHistory: {},
      viewMode: 'wizard',
      folderId: null,
      tags: [],
      history: [],
      consistencyReport: { isChecking: false, report: '' },
      aiDirectives: ''
    };
  }

  savePortfolio(portfolio: Portfolio): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(portfolio));
    } catch (e) {
      console.error('Error saving portfolio to localStorage', e);
    }
  }

  loadPortfolio(): Portfolio {
    try {
      const savedData = localStorage.getItem(this.storageKey);
      if (savedData) {
        const parsedData: Portfolio = JSON.parse(savedData);
        // Ensure dates are correctly parsed
        parsedData.projects = parsedData.projects.map(p => ({
          ...p,
          lastModified: new Date(p.lastModified),
          history: (p.history || []).map(h => ({ ...h, timestamp: new Date(h.timestamp) }))
        }));
        return parsedData;
      }
    } catch (e) {
      console.error('Error loading portfolio from localStorage', e);
    }
    return { projects: [], folders: [] };
  }
}
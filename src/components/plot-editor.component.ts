
import { Component, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../services/store.service';
import { GeminiService } from '../services/gemini.service';
import { PlotPoint } from '../services/persistence.service';
import { IconPlus, IconSparkles, IconTrash, IconLoader } from './icons';

@Component({
  selector: 'app-plot-editor',
  standalone: true,
  imports: [FormsModule, IconPlus, IconSparkles, IconTrash, IconLoader],
  template: `
    <div class="flex flex-col h-full">
        <div class="flex-shrink-0 mb-6">
          <h2 class="text-2xl font-bold text-zinc-100 tracking-tight">Plot Points</h2>
          <p class="text-sm text-zinc-400">Outline the key events of your story. Think in terms of scenes or "beats".</p>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar pr-4 -mr-4 space-y-4">
            @for (point of plotPoints(); track point.id) {
                <div class="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl relative group space-y-4">
                     <button (click)="removePlotPoint(point.id)" class="absolute top-4 right-4 p-1.5 bg-zinc-800/50 text-zinc-500 hover:bg-red-500/20 hover:text-red-400 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <icon-trash class="w-4 h-4" />
                    </button>
                    <div>
                        <label class="text-sm font-medium text-zinc-300 block mb-2">Beat Title</label>
                        <input type="text" [value]="point.title" (input)="updatePlotPoint(point.id, 'title', $event.target.value)"
                            placeholder="e.g., The Inciting Incident"
                            class="w-full bg-zinc-950 text-zinc-100 rounded-xl border border-zinc-800 p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-sm" />
                    </div>
                     <div>
                        <label class="text-sm font-medium text-zinc-300 block mb-2">Description</label>
                        <div class="relative">
                            <textarea [value]="point.description" (input)="updatePlotPoint(point.id, 'description', $event.target.value)"
                                placeholder="Describe what happens in this beat..."
                                class="w-full h-32 bg-zinc-950 text-zinc-100 rounded-xl border border-zinc-800 p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-mono text-sm"
                            ></textarea>
                            <button (click)="refineDescription(point)" 
                                [disabled]="refiningState()[point.id]"
                                class="absolute bottom-2 right-2 p-1.5 bg-zinc-800 text-zinc-400 hover:text-indigo-300 rounded-md transition-colors disabled:opacity-50">
                                @if(refiningState()[point.id]) {
                                    <icon-loader class="w-3.5 h-3.5 animate-spin" />
                                } @else {
                                    <icon-sparkles class="w-3.5 h-3.5" />
                                }
                            </button>
                        </div>
                    </div>
                </div>
            }
             <button (click)="addPlotPoint()" class="w-full flex items-center justify-center gap-2 text-zinc-400 border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 hover:text-indigo-300 rounded-xl p-6 transition-colors">
                <icon-plus class="w-5 h-5" />
                Add New Plot Point
            </button>
        </div>
    </div>
  `
})
export class PlotEditorComponent {
  store = inject(StoreService);
  gemini = inject(GeminiService);

  plotPoints = computed(() => this.store.wizardData()?.plot || []);
  refiningState = signal<Record<string, boolean>>({});

  addPlotPoint() {
    const newPoint: PlotPoint = {
      id: `plot_${Date.now()}`,
      title: 'New Beat',
      description: ''
    };
    this.store.updateProject(p => ({
      ...p,
      wizardData: { ...p.wizardData, plot: [...p.wizardData.plot, newPoint] }
    }));
  }

  removePlotPoint(id: string) {
     this.store.updateProject(p => ({
      ...p,
      wizardData: { ...p.wizardData, plot: p.wizardData.plot.filter(pt => pt.id !== id) }
    }));
  }

  updatePlotPoint(id: string, field: keyof Omit<PlotPoint, 'id'>, value: string) {
    this.store.updateProject(p => ({
      ...p,
      wizardData: {
        ...p.wizardData,
        plot: p.wizardData.plot.map(pt => pt.id === id ? { ...pt, [field]: value } : pt)
      }
    }));
  }

  async refineDescription(point: PlotPoint) {
    this.refiningState.update(s => ({...s, [point.id]: true}));
    try {
      const refinedText = await this.gemini.refineText(point.description, `Refining a plot point titled "${point.title}".`);
      this.updatePlotPoint(point.id, 'description', refinedText);
    } catch (e) {
      console.error('Failed to refine plot point', e);
    } finally {
      this.refiningState.update(s => ({...s, [point.id]: false}));
    }
  }
}

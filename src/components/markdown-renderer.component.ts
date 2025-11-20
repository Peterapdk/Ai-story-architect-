
import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-markdown-renderer',
  standalone: true,
  template: `
    <div class="prose prose-invert prose-sm max-w-none text-zinc-300 font-serif leading-relaxed" [innerHTML]="renderedContent()"></div>
  `
})
export class MarkdownRendererComponent {
  content = input.required<string>();

  renderedContent = computed(() => {
    let text = this.content() || '';
    
    // Basic HTML Escape
    text = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Bold (**text**)
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-200 font-bold">$1</strong>');
    
    // Italic (*text*)
    text = text.replace(/\*(.*?)\*/g, '<em class="text-zinc-400">$1</em>');
    
    // Headers (### Text)
    text = text.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-zinc-100 mt-4 mb-2">$1</h3>');
    text = text.replace(/^## (.*$)/gm, '<h3 class="text-xl font-semibold text-zinc-100 mt-4 mb-2">$1</h3>');
    text = text.replace(/^# (.*$)/gm, '<h3 class="text-2xl font-bold text-zinc-100 mt-4 mb-2">$1</h3>');
    
    // Lists (- item)
    text = text.replace(/^\- (.*$)/gm, '<div class="flex gap-2 ml-2 mb-1"><span class="text-zinc-500">•</span><span>$1</span></div>');
    
    // Line breaks
    text = text.replace(/\n/g, '<br />');

    return text;
  });
}

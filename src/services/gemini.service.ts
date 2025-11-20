
import { Injectable } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse, Part, Operation, GenerateVideosResponse } from '@google/genai';
import { Character, PlotPoint, Project } from './persistence.service';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;
  private textModelName = 'gemini-2.5-flash';
  private imageModelName = 'imagen-4.0-generate-001';
  private videoModelName = 'veo-2.0-generate-001';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private handleError(action: string, error: any): never {
    console.error(`Gemini Service Error (${action}):`, error);
    
    let userMessage = 'An unexpected error occurred. Please check the console for details.';
    const errorString = String(error);
    
    if (errorString.includes('429') || errorString.includes('ResourceExhausted')) {
      userMessage = 'You are sending requests too quickly. Please wait a moment.';
    } else if (errorString.includes('503') || errorString.includes('500')) {
      userMessage = 'The AI service is currently experiencing high traffic. Please try again later.';
    } else if (errorString.includes('API_KEY')) {
       userMessage = 'API Key is invalid or missing.';
    } else if (error instanceof Error) {
       userMessage = error.message.length < 100 ? error.message : userMessage;
    }

    throw new Error(userMessage);
  }

  async refineText(currentText: string, context: string, specificInstruction: string = ''): Promise<string> {
    const prompt = `
      You are an expert creative writing editor.
      [CONTEXT]
      ${context}
      
      [CURRENT DRAFT]
      "${currentText}"

      [TASK]
      Rewrite the draft to be more descriptive, evocative, and professional. 
      ${specificInstruction ? `Specific Instruction: ${specificInstruction}` : 'Enhance vocabulary and clarity.'}
      
      Return ONLY the rewritten text.
    `;
    try {
      const response = await this.ai.models.generateContent({ model: this.textModelName, contents: prompt });
      return response.text;
    } catch (error) { this.handleError('Refine Text', error); }
  }

  async *generateStoryStream(wizardData: any, fullPrompt: string): AsyncGenerator<string> {
    try {
      const responseStream = await this.ai.models.generateContentStream({ model: this.textModelName, contents: fullPrompt });
      for await (const chunk of responseStream) { yield chunk.text; }
    } catch (error) { this.handleError('Generate Story', error); }
  }

  async *continueStoryStream(wizardData: any, currentStory: string, directives: string): AsyncGenerator<string> {
    const prompt = `
      You are an expert creative writing assistant.
      
      [STORY CONTEXT]
      Core Idea: ${wizardData.idea?.prompt || 'N/A'}
      Style/Tone Analysis: ${wizardData.tone?.analysis || 'N/A'}
      
      [CURRENT STORY TEXT]
      ${currentStory}
      
      [TASK]
      Continue the story immediately from where it ends. Do not repeat the last sentence.
      ${directives ? `[USER INSTRUCTIONS]:\n${directives}` : 'Advance the plot naturally.'}
    `;
    try {
      const responseStream = await this.ai.models.generateContentStream({ model: this.textModelName, contents: prompt });
      for await (const chunk of responseStream) { yield chunk.text; }
    } catch (error) { this.handleError('Continue Story', error); }
  }

  async analyzeStyle(textToAnalyze: string): Promise<string> {
    const prompt = `Analyze the writing style of the following text. Focus on sentence structure, vocabulary, tone, perspective, and use of literary devices. Describe the style in a concise, analytical paragraph.
    
    [TEXT TO ANALYZE]
    ---
    ${textToAnalyze}
    ---
    
    Return ONLY the style analysis.`;
    try {
      const response = await this.ai.models.generateContent({ model: this.textModelName, contents: prompt });
      return response.text;
    } catch (error) { this.handleError('Analyze Style', error); }
  }

  async generateMoodboard(prompt: string): Promise<string[]> {
    try {
      const response = await this.ai.models.generateImages({
        model: this.imageModelName,
        prompt: `A cinematic moodboard for a story with the following visual style: ${prompt}. Generate 4 distinct, cohesive images.`,
        config: { numberOfImages: 4, outputMimeType: 'image/jpeg' }
      });
      return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
    } catch (error) { this.handleError('Generate Moodboard', error); }
  }

  async researchTopic(query: string, projectContext: string): Promise<{ text: string, sources: any[] }> {
    const prompt = `A user is researching a topic for their creative writing project.
    [PROJECT CONTEXT]: ${projectContext}
    [RESEARCH QUERY]: ${query}
    
    Provide a concise summary based on the query.`;
    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: this.textModelName,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
      });
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      return { text: response.text, sources };
    } catch (error) { this.handleError('Research Topic', error); }
  }

  async generateStoryboard(plotPoints: PlotPoint[], projectContext: string): Promise<string[]> {
    const plotSummary = plotPoints.map(p => `- ${p.title}: ${p.description}`).join('\n');
    const prompt = `You are a film director. Based on the following plot points for a project, create a storyboard of 5 key cinematic shots.
    
    [PROJECT CONTEXT]: ${projectContext}

    [PLOT]:
    ${plotSummary}
    
    Return a numbered list of shot descriptions. Each shot should be a single, descriptive sentence. Example: "1. WIDE SHOT: The lone starship drifts silently against the swirling colors of the Orion Nebula."`;
    try {
      const response = await this.ai.models.generateContent({ model: this.textModelName, contents: prompt });
      return response.text.split('\n').filter(line => line.match(/^\d+\./));
    } catch (error) { this.handleError('Generate Storyboard', error); }
  }
  
  async analyzePrompt(fullPrompt: string): Promise<string> {
    const prompt = `You are a prompt engineering expert for creative writing AI. Analyze the following story prompt for clarity, consistency, creative potential, and adherence to best practices. Provide a concise, bulleted list of actionable feedback for improvement.
    
    [PROMPT TO ANALYZE]:
    ---
    ${fullPrompt}
    ---
    
    Return ONLY the feedback as a markdown list.`;
    try {
      const response = await this.ai.models.generateContent({ model: this.textModelName, contents: prompt });
      return response.text;
    } catch (error) { this.handleError('Analyze Prompt', error); }
  }

  async startVideoGeneration(prompt: string): Promise<Operation<GenerateVideosResponse>> {
    try {
      return await this.ai.models.generateVideos({
        model: this.videoModelName,
        prompt: `Cinematic, high-quality, professional shot: ${prompt}`,
        config: { numberOfVideos: 1 }
      });
    } catch (error) { this.handleError('Start Video Generation', error); }
  }

  async getVideoOperation(operation: Operation<GenerateVideosResponse>): Promise<Operation<GenerateVideosResponse>> {
    try {
      return await this.ai.operations.getVideosOperation({ operation });
    } catch (error) { this.handleError('Get Video Operation', error); }
  }

  async fetchVideo(uri: string): Promise<Blob> {
     try {
        const response = await fetch(`${uri}&key=${process.env.API_KEY}`);
        if (!response.ok) throw new Error(`Failed to fetch video: ${response.statusText}`);
        return response.blob();
     } catch (error) { this.handleError('Fetch Video', error); }
  }

  async editSelection(text: string, instruction: string): Promise<string> {
    const prompt = `You are a writing assistant. A user has selected the following text from their document and wants you to edit it.
    
    [SELECTED TEXT]:
    ---
    ${text}
    ---
    
    [INSTRUCTION]: "${instruction}"
    
    Return ONLY the rewritten text, maintaining the original tone unless instructed otherwise.`;
    try {
      const response = await this.ai.models.generateContent({ model: this.textModelName, contents: prompt });
      return response.text;
    } catch (error) { this.handleError('Edit Selection', error); }
  }
  
  async *generateCharacterResponseStream(character: Character, history: { user: string; model: string }[], message: string): AsyncGenerator<string> {
    const prompt = `
      You are an AI actor. Adopt the persona of the following character and respond to the user's message in character.
      
      [CHARACTER PROFILE]:
      - Name: ${character.name}
      - Description: ${character.description}
      - Motivation: ${character.motivation}
      
      [CONVERSATION HISTORY]:
      ${history.map(turn => `User: ${turn.user}\nYou: ${turn.model}`).join('\n\n')}
      
      [USER'S NEW MESSAGE]: "${message}"
      
      Respond now as the character. Keep your response concise and in character. Do not break character.
    `;
    try {
      const responseStream = await this.ai.models.generateContentStream({ model: this.textModelName, contents: prompt });
      for await (const chunk of responseStream) { yield chunk.text; }
    } catch (error) { this.handleError('Generate Character Response', error); }
  }

  async checkConsistency(project: Project): Promise<string> {
    const characterProfiles = project.wizardData.characters.map(c => `- ${c.name}: ${c.description}`).join('\n');
    const storyText = project.generatedScenes.map(s => s.content).join('\n\n');

    const prompt = `
      You are an expert continuity editor for novels. Read the following project context, character profiles, and the full story draft. Your task is to identify any inconsistencies.
      
      [PROJECT CONTEXT]:
      Title: ${project.title}
      Custom Directives: ${project.aiDirectives || 'None'}

      [AREAS TO CHECK]:
      - Character details (eye color, names, established traits) that change without reason.
      - Plot holes or contradictions in the timeline.
      - Contradictory statements or events.
      
      [CHARACTER PROFILES]:
      ${characterProfiles}
      
      [STORY DRAFT]:
      ${storyText}
      
      [TASK]:
      Analyze the story draft against the character profiles and its own internal logic. If you find any inconsistencies, list them as a bulleted markdown report. If you find no issues, respond with "No inconsistencies found."
    `;
    try {
      const response = await this.ai.models.generateContent({ model: this.textModelName, contents: prompt });
      return response.text;
    } catch (error) { this.handleError('Check Consistency', error); }
  }
  
  async generateIdeas(context: string, specificInstruction: string): Promise<string> {
    const prompt = `
      You are an expert creative writing brainstormer.
      [CONTEXT]:
      ${context}

      [TASK]:
      Generate creative ideas based on the following instruction.
      Instruction: ${specificInstruction}
      
      Return ONLY the generated ideas in a clear, concise format.
    `;
    try {
      const response = await this.ai.models.generateContent({ model: this.textModelName, contents: prompt });
      return response.text;
    } catch (error) { this.handleError('Generate Ideas', error); }
  }
}

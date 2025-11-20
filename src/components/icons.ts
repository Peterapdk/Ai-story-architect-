
import { Component, input } from '@angular/core';

// --- EXISTING ICONS ---

@Component({
  selector: 'icon-sparkles', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`
})
export class IconSparkles { class = input<string>(''); }

@Component({
  selector: 'icon-undo', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>`
})
export class IconUndo { class = input<string>(''); }

@Component({
  selector: 'icon-redo', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>`
})
export class IconRedo { class = input<string>(''); }

@Component({
  selector: 'icon-chevron-right', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`
})
export class IconChevronRight { class = input<string>(''); }

@Component({
  selector: 'icon-chevron-left', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`
})
export class IconChevronLeft { class = input<string>(''); }

@Component({
  selector: 'icon-book', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`
})
export class IconBook { class = input<string>(''); }

@Component({
  selector: 'icon-pen', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>`
})
export class IconPen { class = input<string>(''); }

@Component({
  selector: 'icon-loader', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`
})
export class IconLoader { class = input<string>(''); }

@Component({
  selector: 'icon-plus', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`
})
export class IconPlus { class = input<string>(''); }

@Component({
  selector: 'icon-save', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`
})
export class IconSave { class = input<string>(''); }

@Component({
  selector: 'icon-check', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
})
export class IconCheck { class = input<string>(''); }

@Component({
  selector: 'icon-alert', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`
})
export class IconAlert { class = input<string>(''); }

@Component({
  selector: 'icon-google', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke-width="0"><path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.908 8.908 0 0 0 8.934 8.934c4.956 0 8.41-3.52 8.41-8.663a8.4 8.4 0 0 0-.202-1.898z"/></svg>`
})
export class IconGoogle { class = input<string>(''); }

@Component({
  selector: 'icon-dashboard', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`
})
export class IconDashboard { class = input<string>(''); }

@Component({
  selector: 'icon-trash', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`
})
export class IconTrash { class = input<string>(''); }

@Component({
  selector: 'icon-microscope', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>`
})
export class IconMicroscope { class = input<string>(''); }

@Component({
  selector: 'icon-castle', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 21H2a1 1 0 0 0-1 1v0a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1v0a1 1 0 0 0-1-1Z"/><path d="M16 21V8a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v13"/><path d="M18 10h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-1"/><path d="M6 10H5a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1"/><path d="M12 21V8l-2-3V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2l-2 3"/><path d="M12 13a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h0a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1Z"/></svg>`
})
export class IconCastle { class = input<string>(''); }

@Component({
  selector: 'icon-clapperboard', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.2 6 3 11l-.9-2.4c-.3-1 .3-2 1.3-2.3l13.1-4.2c1-.3 2 .3 2.3 1.3Z"/><path d="m5.3 3.3 15.3 5.1"/><path d="M4 11h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z"/></svg>`
})
export class IconClapperboard { class = input<string>(''); }

@Component({
  selector: 'icon-wand', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9a3 3 0 0 0-3-3"/><path d="M12 12a3 3 0 0 0-3 3"/><path d="m4.2 7.8 1.2 1.2"/><path d="M7 15a3 3 0 0 0-3-3"/><path d="M10 6.5 12 5l2 1.5"/><path d="m14 17.5 2 1.5 2-1.5"/><path d="M10 12.5 12 11l2 1.5"/></svg>`
})
export class IconWand { class = input<string>(''); }

@Component({
  selector: 'icon-images', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 22H4a2 2 0 0 1-2-2V6"/><path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18"/><path d="m15 12-1.296-1.296a2.41 2.41 0 0 0-3.408 0L4 17"/><rect width="16" height="16" x="6" y="2" rx="2"/><circle cx="14" cy="10" r="1"/></svg>`
})
export class IconImages { class = input<string>(''); }

@Component({
  selector: 'icon-film', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M21 7.5h-4"/><path d="M21 16.5h-4"/></svg>`
})
export class IconFilm { class = input<string>(''); }

@Component({
  selector: 'icon-lightbulb', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`
})
export class IconLightbulb { class = input<string>(''); }

@Component({
  selector: 'icon-check-circle', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`
})
export class IconCheckCircle { class = input<string>(''); }

@Component({
  selector: 'icon-cloud', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`
})
export class IconCloud { class = input<string>(''); }

@Component({
  selector: 'icon-cloud-check', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="m9 12 2 2 4-4"/></svg>`
})
export class IconCloudCheck { class = input<string>(''); }

@Component({
  selector: 'icon-repeat', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>`
})
export class IconRepeat { class = input<string>(''); }

@Component({
  selector: 'icon-minimize-2', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" x2="21" y1="10" y2="3"/><line x1="3" x2="10" y1="21" y2="14"/></svg>`
})
export class IconMinimize2 { class = input<string>(''); }

@Component({
  selector: 'icon-eye', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`
})
export class IconEye { class = input<string>(''); }

@Component({
  selector: 'icon-message-square', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
})
export class IconMessageSquare { class = input<string>(''); }

@Component({
  selector: 'icon-download', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`
})
export class IconDownload { class = input<string>(''); }

// --- ICONS FOR NEW FEATURES ---

@Component({
  selector: 'icon-history', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>`
})
export class IconHistory { class = input<string>(''); }

@Component({
  selector: 'icon-x', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`
})
export class IconX { class = input<string>(''); }

@Component({
  selector: 'icon-folder', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L8.6 3.3A2 2 0 0 0 6.9 2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z"/></svg>`
})
export class IconFolder { class = input<string>(''); }

@Component({
  selector: 'icon-folder-plus', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L8.6 3.3A2 2 0 0 0 6.9 2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16Z"/><line x1="12" x2="12" y1="10" y2="16"/><line x1="9" x2="15" y1="13" y2="13"/></svg>`
})
export class IconFolderPlus { class = input<string>(''); }

@Component({
  selector: 'icon-tag', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.432 0l6.568-6.568a2.426 2.426 0 0 0 0-3.432L12.586 2.586Z"/><circle cx="8.5" cy="8.5" r=".5" fill="currentColor"/></svg>`
})
export class IconTag { class = input<string>(''); }

@Component({
  selector: 'icon-more-vertical', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>`
})
export class IconMoreVertical { class = input<string>(''); }

@Component({
  selector: 'icon-shield-check', standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>`
})
export class IconShieldCheck { class = input<string>(''); }

@Component({
  selector: 'icon-arrow-up',
  standalone: true,
  template: `<svg xmlns="http://www.w3.org/2000/svg" [class]="class()" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>`
})
export class IconArrowUp { class = input<string>(''); }

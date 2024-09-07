const appTitle = 'CBZ and EPUB Web Viewer';

export function setTitle(title: string) {
  document.title = `${title} — ${appTitle}`;
}

export function setDefaultTitle() {
  document.title = appTitle;
}
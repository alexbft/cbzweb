export function dirName(path: string): string {
  return path.replace(/\/[^/]*$/, '');
}
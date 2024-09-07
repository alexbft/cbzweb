export function nodeToArray<T>(node: T | T[]): T[] {
  return Array.isArray(node) ? node : [node];
}
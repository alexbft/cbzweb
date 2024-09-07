import libResolvePath from "@einheit/path-resolve";

export function resolvePath(...pathSegments: string[]): string {
  const result = libResolvePath("/", ...pathSegments);
  return result.substring(1);
}
import fg from "fast-glob";

export const universalGlob = (pattern: string) => {
  if (typeof Bun !== "undefined") {
    return new Bun.Glob(pattern).scanSync();
  }

  return fg.globSync(pattern);
}
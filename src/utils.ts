import fs from "node:fs";

export function universalGlob(pattern: string) {
	if (typeof Bun !== "undefined") {
		return Array.from(new Bun.Glob(pattern).scanSync());
	}

	return fs.globSync(pattern);
}

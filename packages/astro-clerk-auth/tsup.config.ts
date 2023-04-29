import { defineConfig } from "tsup";

export default defineConfig((options) => {
	return {
		clean: true,
		entry: ["src/index.ts","src/middleware/index.ts"],
		dts: true,
		onSuccess: "tsc --emitDeclarationOnly --declaration",
		minify: !options.watch,
		sourcemap: true,
		format: ["esm"],
	};
});

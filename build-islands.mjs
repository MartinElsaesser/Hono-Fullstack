// @ts-check
import * as esbuild from "esbuild";

/** @type {import('esbuild').BuildOptions} */
const buildOptions = {
	entryPoints: ["src/config/islands/client.tsx"],
	bundle: true,
	minify: false,
	sourcemap: "inline",
	format: "esm",
	outdir: "/static/build",
	chunkNames: "[name]-[hash]",
	splitting: true,
};

///////////////////////
// start esbuild
const startInDevMode = process.argv.includes("--watch");

if (startInDevMode) {
	console.log("Started watch mode for client files");

	// watch and re-transpile typescript files on change
	let ctx = await esbuild.context(buildOptions);
	await ctx.watch();
} else {
	console.log("Building client files");

	// transpile typescript files
	let ctx = await esbuild.build(buildOptions);
}

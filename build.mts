/* eslint-env node */
import esbuild, { Plugin } from "esbuild";
import babel from "esbuild-plugin-babel";

const watch = process.argv.some((arg) => ["--watch", "-w"].includes(arg));

const context = await esbuild.context({
    bundle: true,
    platform: "node",
    target: "rhino1.7.14",
    external: ["kolmafia"],
    entryPoints: {
        "KoLmafia/scripts/autosea/autosea": "src/main.ts",
        "KoLmafia/scripts/autosea/autosea_choice": "src/standalone/autosea_choice.ts"
    },
    entryNames: "[dir]/[name]",
    outdir: "dist",
    plugins: [babel() as Plugin],
});

await context.rebuild();

if (watch) {
    await context.watch();
} else {
    context.dispose();
}

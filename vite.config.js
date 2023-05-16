import { fileURLToPath, URL } from "node:url";
import path from "node:path";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import eslintPlugin from "vite-plugin-eslint";

import components from "unplugin-vue-components/vite";
import autoImport from "unplugin-auto-import/vite";
import { VarletUIResolver } from "unplugin-vue-components/resolvers";
import copy from "rollup-plugin-copy";

import { createSvgIconsPlugin } from "vite-plugin-svg-icons";

const packageJson = require("./package.json");
const projectName = packageJson.name || __dirname.split("\\").pop();
const projectVersion = packageJson.version;

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  build: {
    outDir: projectName,
  },
  plugins: [
    vue(),
    eslintPlugin({
      include: ["src/**/*.{vue,js,ts,jsx,tsx}"],
    }),
    components({
      resolvers: [VarletUIResolver()],
    }),
    autoImport({
      resolvers: [VarletUIResolver({ autoImport: true })],
    }),
    copy({
      targets: [
        {
          src: "src/auto/**",
          dest: "public",
          transform: (_contents, name) => {
            let contents = _contents.toString();
            if (name === "project.json") {
              const contentsObj = JSON.parse(contents);
              contentsObj.name = projectName;
              contentsObj.packageName = `com.autoxjs.${projectName}`;
              contentsObj.versionName = projectVersion;
              contentsObj.versionCode = parseInt(projectVersion);
              contents = JSON.stringify(contentsObj);
            }
            return contents;
          },
        },
      ],
      verbose: true,
    }),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), "src/assets/svgs")],
      symbolId: "icon-[dir]-[name]",
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {},
    postcss: "postcss.config.cjs",
  },
});

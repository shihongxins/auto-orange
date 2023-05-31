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

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // const env = loadEnv(mode, process.cwd(), "");

  // console.log(mode, env);
  const packageJson = require("./package.json");

  const config = {
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
    define: {
      _autoxjs_: mode === "development" ? {} : null,
      projectVersion: JSON.stringify(packageJson.version),
    },
  };
  // vite build -m autoxjs-local
  if (mode === "autoxjs-local") {
    const authorName = packageJson?.author?.name || "autoxjs";
    const projectName = packageJson.name || __dirname.split("\\").pop();
    const projectVersion = JSON.stringify(packageJson.version);
    const AppPackageName = `com.${authorName}.${projectName}`.replace(/[^\w.]/g, "_").toLowerCase();

    config.base = "./";
    config.build = Object.assign(config.build || {}, {
      outDir: projectName,
      rollupOptions: {
        output: {
          format: "umd",
          entryFileNames: "[name].mjs",
          chunkFileNames: "assets/[name]-[hash].mjs",
        },
      },
    });
    config.plugins = [
      ...config.plugins,
      copy({
        verbose: true,
        targets: [
          {
            src: ["src/auto/**/*", "!src/auto/modules/**/*"],
            dest: "public",
          },
          {
            src: "src/auto/project.json",
            dest: "public",
            transform: (_contents, name) => {
              let contents = _contents.toString();
              if (name === "project.json") {
                const contentsObj = JSON.parse(contents);
                contentsObj.name = contentsObj.name || projectName;
                contentsObj.packageName = AppPackageName;
                contentsObj.versionName = projectVersion;
                contentsObj.versionCode = parseInt(projectVersion) || 0;
                contents = JSON.stringify(contentsObj);
              }
              return contents;
            },
          },
        ],
      }),
    ];
  }
  return config;
});

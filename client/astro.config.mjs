import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

import node from "@astrojs/node";

export default defineConfig({
  output: "server",
  server: {
    host: "0.0.0.0",
    port: 4321,
    https: false,
  },
  https: false,
  integrations: [react(), tailwind()],
  adapter: node({
    mode: "standalone",
  }),
});

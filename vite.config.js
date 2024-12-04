// vite.config.js
import { defineConfig } from "vite";
import { VitePWA } from 'vite-plugin-pwa'


export default defineConfig({
    // config options
    base: "/cmpm-121-final/",
    build:{
        outDir:"./dist"
    },
    plugins: [
        VitePWA({ registerType: 'autoUpdate' })
      ]
});
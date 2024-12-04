// vite.config.js
import { defineConfig } from "vite";
import { VitePWA } from 'vite-plugin-pwa'



export default defineConfig({
    // config options
    base: "/cmpm-121-final/",
    build: {
        outDir: "./dist"
    },
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: '121 Farming Game',
                short_name: '121Farm',
                description: 'cmpm 121 final project',
                theme_color: '#094e67',
                icons: [
                    {
                        src: "128.png",
                        sizes: '128x128',
                        type: 'image/png'
                    },
                    {
                        src: "512.png",
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }
        })
    ]
});
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
            registerType: 'autoUpdate', includeAssets: ['./icons/128.png', './icons/512.png'],
            manifest: {
                name: '121 Farming Game',
                short_name: '121Farm',
                description: 'cmpm 121 final project',
                theme_color: '#094e67',
                icons: [
                    {
                        src: './icons/192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: './icons/512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }
        })
    ]
});
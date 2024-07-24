// https://nuxt.com/docs/api/configuration/nuxt-config
import materialIcons from 'quasar/icon-set/svg-material-icons'
import materialIconsRound from 'quasar/icon-set/svg-material-icons-round'

export default defineNuxtConfig({
  devtools: {
    enabled: true,
    timeline: {
      enabled: true
    }
  },
  dev: true,
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_URL,
      kakaoApiKey: process.env.KAKAO_API_KEY
    }
  },
  modules: [
    'dayjs-nuxt',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    'nuxt-quasar-ui',
    '@nuxt/devtools',
    '@nuxt/eslint',
    '@vueuse/nuxt',
    'nuxt-monaco-editor',
    "@formkit/auto-animate/nuxt",
    "@vite-pwa/nuxt"
  ],
  quasar: {
    plugins: [
      'AppFullscreen',
      'BottomSheet',
      'Dialog',
      'Loading',
      'LoadingBar',
      'Notify'
    ],
    //sassVariables: 'css/quasar.variables.sass',
    sassVariables: true,
    quietSassWarnings: true,
    lang: 'ko-KR',
    iconSet: {
      ...materialIcons,
      colorPicker: materialIconsRound.colorPicker,
    },
    config: {},
    extras: {
      font: null,
      fontIcons: [
        'material-icons',
        'mdi-v7',
        'fontawesome-v6',
        'bootstrap-icons'
      ],
      animations: 'all'
    }
  },
  piniaPersistedstate: {
    storage: 'sessionStorage'
  },
  monacoEditor: {
    locale: 'ko',
    componentName: {
      codeEditor: 'CodeEditor',
      diffEditor: 'DiffEditor'
    }
  },
  vite: {
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    }
  },
  pwa: {
    manifest: {
      name: 'Playground',
      short_name: 'Playground',
      description: 'Playground 홈페이지',
      theme_color: "#ffffff",
      icons: [
        {
          src: "icon/playground_x48.png",
          sizes: "48x48",
          type: "image/png"
        },
        {
          src: "icon/playground_x72.png",
          sizes: "72x72",
          type: "image/png"
        },
        {
          src: "icon/playground_x96.png",
          sizes: "96x96",
          type: "image/png"
        },
        {
          src: "icon/playground_x128.png",
          sizes: "128x128",
          type: "image/png"
        },
        {
          src: "icon/playground_x192.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "icon/playground_x384.png",
          sizes: "384x384",
          type: "image/png"
        },
        {
          src: "icon/playground_x512.png",
          sizes: "512x512",
          type: "image/png"
        }
      ]
    },
    workbox: {
      navigateFallback: "/",
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600
    },
    devOptions: {
      enabled: true,
      type: "module"
    }
  }
})
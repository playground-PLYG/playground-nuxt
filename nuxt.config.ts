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
      envProfile: process.env.ENV_PROFILE,
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
    "@vite-pwa/nuxt",
    "@nuxt/scripts"
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
      id: "/?source=pwa",
      start_url: "/?source=pwa",
      scope: "/",
      name: "Playground" + (process.env.ENV_PROFILE == "PROD" ? "" : " - " + process.env.ENV_PROFILE?.toLocaleLowerCase()),
      short_name: "Playground" + (process.env.ENV_PROFILE == "PROD" ? "" : " - " + process.env.ENV_PROFILE?.toLocaleLowerCase()),
      description: "Playground 홈페이지" + (process.env.ENV_PROFILE == "PROD" ? "" : " - " + process.env.ENV_PROFILE?.toLocaleLowerCase()),
      theme_color: "#ffffff",
      background_color: "#1976D2",
      lang: "ko",
      icons: [
        {
          src: "icon/playground_48.png",
          sizes: "48x48",
          type: "image/png"
        },
        {
          src: "icon/playground_72.png",
          sizes: "72x72",
          type: "image/png"
        },
        {
          src: "icon/playground_96.png",
          sizes: "96x96",
          type: "image/png"
        },
        {
          src: "icon/playground_128.png",
          sizes: "128x128",
          type: "image/png"
        },
        {
          src: "icon/playground_192.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "icon/playground_384.png",
          sizes: "384x384",
          type: "image/png"
        },
        {
          src: "icon/playground_512.png",
          sizes: "512x512",
          type: "image/png"
        }
      ],
      screenshots: [
        {
          "src": "icon/playground_540x720.png",
          "type": "image/png",
          "sizes": "540x720",
          "form_factor": "narrow"
        },
        {
          "src": "icon/playground_720x540.png",
          "type": "image/jpg",
          "sizes": "720x540",
          "form_factor": "wide"
        }
      ]
    },
    workbox: {
      navigateFallback: "/"
    },
    client: {
      installPrompt: true
    },
    devOptions: {
      enabled: true,
      type: "module"
    }
  },

  compatibilityDate: "2024-08-06"
})
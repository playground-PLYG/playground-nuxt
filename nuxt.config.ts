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
    "@formkit/auto-animate/nuxt"
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
  }
})
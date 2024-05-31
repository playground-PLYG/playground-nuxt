// https://nuxt.com/docs/api/configuration/nuxt-config

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
    '@vueuse/nuxt'
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
    quietSassWarnings: true,
    lang: 'ko-KR',
    iconSet: 'material-icons',
    config: {},
    extras: {
      font: null,
      fontIcons: ['material-icons', 'fontawesome-v6', 'mdi-v7'],
      svgIcons: [],
      animations: 'all'
    }
  },
  piniaPersistedstate: {
    storage: 'sessionStorage'
  }
})

// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [ "dayjs-nuxt", "@pinia/nuxt", "@pinia-plugin-persistedstate/nuxt", "nuxt-quasar-ui", "@nuxt/devtools"],
  quasar: {
    plugins: [
      'AppFullscreen',
      'BottomSheet',
      'Dialog',
      'Loading',
      'LoadingBar',
      'Notify',
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
      animations: "all"
    }
  },
  piniaPersistedstate: {
    storage: 'sessionStorage'
  },
})

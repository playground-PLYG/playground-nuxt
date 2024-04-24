import { defineStore } from "pinia"

export const useAuthStore = defineStore('auth', () => {

  let accessToken = ref<any>("")
  let userName = ref<any>("")
  let snsLogin = ref<any>("")

  const isLogin = computed(() => accessToken?.value == ''? false : true)

  function resetAuth() {
    accessToken.value = ''
    userName.value = ''
    snsLogin.value = ''
  }

  return { accessToken, userName, snsLogin, isLogin, resetAuth}
})
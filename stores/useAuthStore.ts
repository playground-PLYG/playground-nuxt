import { defineStore } from "pinia"

export const useAuthStore = defineStore('auth', () => {
  let token = ref<any>("")
  let name = ref<any>("")

  function isLogin() {
    return token == null? false : true ;
  }

  return { token, name, isLogin}
})
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { useCookie } from 'nuxt/app'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const router = useRouter()

    const mberId = ref('')
    const token = ref('')

    const isLogin = computed(() => (token.value == '' ? false : true))

    function logout() {
      useCookie('token', { expires: new Date(), watch: false })
      mberId.value = ''
      token.value = ''
      alert('로그아웃되었습니다.')
      return router.push('/login')
    }

    return { mberId, token, isLogin, logout }
  },
  {
    persist: true
  }
)

<template>
  <div class="text-lg">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { ofetch } from 'ofetch'
import { useCookie } from 'nuxt/app'
import { useAuthStore } from '/stores/useAuthStore'
const config = useRuntimeConfig()

const token = useCookie('token')
const refreshToken = useCookie('refreshToken')
const authStore = useAuthStore()
let HeadersInit

if (token.value) {
  HeadersInit = {
    Authorization: `Bearer ${token.value}`
  }
}

globalThis.$fetch = ofetch.create({
  baseURL: config.public.apiBaseUrl,
  headers: HeadersInit,
  onResponseError: (error) => {
    if (error.response._data.resultCode == 'EC0006') {
      /*
       * JWT 토큰 만료 시
       * header 없는 요청으로 fetch 초기화
       */
      globalThis.$fetch = ofetch.create({
        baseURL: config.public.apiBaseUrl
      })

      $fetch('/playground/api/member/reissue', {
        method: 'POST',
        body: JSON.stringify({
          accessToken: token.value,
          refreshToken: refreshToken.value
        })
      })
        .then((result) => {
          //토큰을 재발급 후 cookie, store에 저장
          token.value = result.data.accessToken
          refreshToken.value = result.data.refreshToken
          authStore.mberId =
            result.data.mberId == null ? '' : result.data.mberId
          authStore.token = result.data.accessToken
        })
        .then(() => {
          //발급받은 토큰을 재 세팅
          HeadersInit = {
            Authorization: `Bearer ${token.value}`
          }

          globalThis.$fetch = ofetch.create({
            baseURL: config.public.apiBaseUrl,
            headers: HeadersInit
          })

          //re-fetch 를 해야하는데..
          const retryResponse = $fetch(error.request, {
            method: error.options.method,
            body: error.options.body
          })

          return retryResponse
        })
        .catch(() => {
          return
        })
    } else if (error.response.status == '401') {
      // JWT 에러 니까 로그아웃 처리 필요
      // 로그아웃 function
    }
  }
})
</script>

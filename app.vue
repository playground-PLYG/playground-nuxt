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

const config = useRuntimeConfig()

const getToken = useCookie('token')
let HeadersInit

if (getToken.value) {
  HeadersInit = {
    Authorization: `Bearer ${getToken.value}`
  }
}

globalThis.$fetch = ofetch.create({
  baseURL: config.public.apiBaseUrl,
  headers: HeadersInit
})
</script>

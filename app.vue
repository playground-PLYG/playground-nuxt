<template>
  <div class="text-lg">
    <VitePwaManifest />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { ofetch } from 'ofetch'
import { useCookie, useNuxtApp, useRuntimeConfig } from 'nuxt/app'
import { nextTick, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import type { PwaInjection } from './interface/server'

const config = useRuntimeConfig()
const nuxtApp = useNuxtApp()
const $pwa = nuxtApp.$pwa as PwaInjection

const $q = useQuasar()
$q.addressbarColor.set('#1976d2')

const getToken = useCookie('token')
let HeadersInit

if (getToken.value) {
  HeadersInit = {
    Authorization: `Bearer ${getToken.value}`
  }
}

globalThis.$fetch = ofetch.create({
  baseURL: config.public.apiBaseUrl as string,
  headers: HeadersInit
})

onMounted(async () => {
  await nextTick()

  if ($pwa) {
    if ($pwa.needRefresh) {
      await $pwa.updateServiceWorker()
    }
  }
})
</script>

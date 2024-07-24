<template>
  <div class="text-lg">
    <VitePwaManifest />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { ofetch } from 'ofetch'
import { useCookie, useNuxtApp } from 'nuxt/app'
import { onMounted } from 'vue'

const config = useRuntimeConfig()
const { $pwa } = useNuxtApp()
const $q = useQuasar()

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

onMounted(async () => {
  if ($pwa.needRefresh) {
    await $pwa.updateServiceWorker()
  }

  if (!$pwa.isPWAInstalled) {
    await nextTick()

    $q.notify({
      message: '앱을 설치하시겠습니까?',
      position: 'top',
      icon: 'announcement',
      color: 'teal',
      progress: true,
      actions: [
        {
          label: '설치',
          color: 'white',
          handler: () => {
            $pwa.install()
          }
        }
      ]
    })
  }
})
</script>

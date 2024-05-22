<template>
  <div class="text-lg">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { ofetch } from 'ofetch'

const config = useRuntimeConfig()

globalThis.$fetch = ofetch.create({ baseURL: config.public.apiBaseUrl })
</script>

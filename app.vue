<template>
  <div class="text-lg">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { ofetch } from 'ofetch'

//globalThis.$fetch = ofetch.create({ baseURL: 'https://bingo-playground.duckdns.org:8080' })
globalThis.$fetch = ofetch.create({ baseURL: 'http://localhost:8080' })
</script>
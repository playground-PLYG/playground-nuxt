<template>
  <q-btn v-bind="attrs" push color="primary" class="dk-button" />
</template>

<script setup lang="ts">
import type { QBtnProps } from 'quasar'
import { useAttrs } from 'vue'

const attrs = useAttrs() as unknown as QBtnProps
</script>

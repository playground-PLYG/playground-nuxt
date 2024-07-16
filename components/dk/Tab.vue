<template>
  <q-tab v-bind="attrs" class="dk-tab" />
</template>

<script setup lang="ts">
import type { QTabProps } from 'quasar'
import { useAttrs } from 'vue'

const attrs = useAttrs() as unknown as QTabProps
</script>

<template>
  <q-tab-panels v-bind="attrs" animated class="dk-tab-panels">
    <slot />
  </q-tab-panels>
</template>

<script setup lang="ts">
import type { QTabPanelsProps } from 'quasar'
import { useAttrs } from 'vue'

const attrs = useAttrs() as unknown as QTabPanelsProps
</script>

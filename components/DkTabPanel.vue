<template>
  <q-tab-panel v-bind="attrs" class="dk-tab-panel">
    <slot />
  </q-tab-panel>
</template>

<script setup lang="ts">
import type { QTabPanelProps } from 'quasar'
import { useAttrs } from 'vue'

const attrs = useAttrs() as unknown as QTabPanelProps
</script>

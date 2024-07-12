<template>
  <q-tabs
    v-bind="attrs"
    dense
    class="dk-tabs text-grey"
    active-color="primary"
    indicator-color="primary"
    align="justify"
    narrow-indicator
  >
    <slot />
  </q-tabs>
</template>

<script setup lang="ts">
import type { QTabsProps } from 'quasar'
import { useAttrs } from 'vue'

const attrs = useAttrs() as unknown as QTabsProps
</script>

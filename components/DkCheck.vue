<template>
  <q-checkbox v-bind="attrs" class="dk-check" />
</template>

<script setup lang="ts">
import type { QCheckboxProps } from 'quasar'
import { useAttrs } from 'vue'

const attrs = useAttrs() as unknown as QCheckboxProps
</script>

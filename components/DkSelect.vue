<template>
  <q-select outlined v-bind="attrs" dense class="dk-select" />
</template>

<script setup lang="ts">
import type { QSelectProps } from 'quasar'
import { useAttrs } from 'vue'

const attrs = useAttrs() as unknown as QSelectProps
</script>

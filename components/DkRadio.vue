<template>
  <q-radio v-bind="attrs" class="dk-radio" />
</template>

<script setup lang="ts">
import type { QRadioProps } from 'quasar'
import { useAttrs } from 'vue'

const attrs = useAttrs() as unknown as QRadioProps
</script>

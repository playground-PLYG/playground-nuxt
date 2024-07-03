<template>
  <q-input v-bind="attrs" outlined round dense flat class="dk-input">
    <template v-for="(_, name) in slots" :key="name">
      <slot :name="name" v-bind="slots[name]" />
    </template>
  </q-input>
</template>

<script setup lang="ts">
import type { QInputProps, QInputSlots } from 'quasar'
import { useAttrs, useSlots } from 'vue'

const slots = useSlots() as unknown as QInputSlots
const attrs = useAttrs() as unknown as QInputProps
</script>

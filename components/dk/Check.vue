<template>
  <q-checkbox v-bind="attrs" class="dk-check">
    <template v-for="(slot, name) in slots" #[name]>
      <slot :name="name" v-bind="slot" />
    </template>
  </q-checkbox>
</template>

<script setup lang="ts">
import type { QCheckboxProps, QCheckboxSlots } from 'quasar'
import { useAttrs, useSlots } from 'vue'

const slots = useSlots() as unknown as QCheckboxSlots
const attrs = useAttrs() as unknown as QCheckboxProps
</script>

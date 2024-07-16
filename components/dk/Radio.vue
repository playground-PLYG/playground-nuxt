<template>
  <q-radio v-bind="attrs" class="dk-radio">
    <template v-for="(slot, name) in slots" #[name]>
      <slot :name="name" v-bind="slot" />
    </template>
  </q-radio>
</template>

<script setup lang="ts">
import type { QRadioProps, QRadioSlots } from 'quasar'
import { useAttrs, useSlots } from 'vue'

const slots = useSlots() as unknown as QRadioSlots
const attrs = useAttrs() as unknown as QRadioProps
</script>

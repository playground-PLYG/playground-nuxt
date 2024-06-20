<script setup lang="ts">
export interface EssentialLinkProps {
  title: string
  caption?: string
  link?: string
  icon?: string
  target?: string
  menuSn?: number
  upperMenuSn?: number
  lwprtMenuHoldAt?: string
  open?: boolean
}
withDefaults(defineProps<EssentialLinkProps>(), {
  caption: '',
  link: '#',
  icon: '',
  target: undefined,
  menuSn: undefined,
  upperMenuSn: undefined,
  lwprtMenuHoldAt: undefined
})
</script>
<template>
  <q-item clickable tag="a" :target="target" :href="link">
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>
        {{ caption }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

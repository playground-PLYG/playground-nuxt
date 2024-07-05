<template>
  <q-dialog
    v-bind="attrs"
    class="dk-dialog bg-white"
    persistent
    :maximized="true"
    :full-width="true"
    :full-height="true"
  >
    <div class="dk-dialog-content">
      <div class="dk-dialog-header">
        <div class="bg-primary">
          <div>{{ props.headerLabel }}</div>
          <q-btn flat round icon="close" @click="fn_closeCallback" />
        </div>
      </div>

      <div class="dk-dialog-body">
        <slot name="body" />
      </div>
      <div class="dk-dialog-footer">
        <slot name="footer" />
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import type { QDialogProps } from 'quasar'
import { useAttrs } from 'vue'

const attrs = useAttrs() as unknown as QDialogProps

interface Data {
  headerLabel?: string
}

const props = defineProps<Data>()
const emit = defineEmits(['close-callback'])

const fn_closeCallback = () => {
  emit('close-callback')
}
</script>

<style lang="scss" scoped>
.dk-dialog-header {
  top: 0;
  left: 0;
  right: 0;
  position: relative;
  display: block;
  z-index: 2000;
  background-color: #1976d2;
  color: #fff;
  box-sizing: inherit;
  -webkit-tap-highlight-color: transparent;
}

.dk-dialog-header > div {
  align-items: center;
  flex-wrap: nowrap;
  display: flex;
  background: #1976d2 !important;
  position: relative;
  padding: 0 12px;
  min-height: 50px;
  width: 100%;
  box-sizing: inherit;
  -webkit-tap-highlight-color: transparent;
}

.dk-dialog-header > div > div:first-child {
  padding-left: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  flex: 1 1 0%;
  min-width: 1px;
  max-width: 100%;
  font-size: 21px;
  font-weight: normal;
  letter-spacing: 0.01em;
  padding: 0 12px;
  color: #fff;
}

.dk-dialog-content {
  background-color: white;
}

.dk-dialog-body {
  padding: 10px;
}

.dk-dialog-footer {
  padding: 10px;
}
</style>

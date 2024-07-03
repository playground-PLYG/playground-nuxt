<template>
  <q-input v-model="_time" mask="##:##" filled>
    <template #append>
      <q-icon name="access_time" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-time v-model="_time" v-bind="$attrs" mask="HH:mm">
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-time>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Data {
  time?: string
}

const props = defineProps<Data>()
const _time = ref(props.time)
const emit = defineEmits(['send-date'])

watch(_time, () => {
  emit('send-date', _time.value, 'dateValue')
})
</script>

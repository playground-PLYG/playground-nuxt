<template>
  <q-input v-model="_date" mask="####-##-##" outline>
    <template #prepend>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date v-bind="$attrs" mask="YYYY-MM-DD">
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Data {
  date?: string
}

const props = defineProps<Data>()
const _date = ref(props.date)
const emit = defineEmits(['send-date'])

watch(_date, () => {
  emit('send-date', _date.value, 'dateValue')
})
</script>

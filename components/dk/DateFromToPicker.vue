<template>
  <div class="row">
    <q-input v-model="_dateFrom" mask="####-##-##" outline>
      <template #prepend>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date
              v-model="_dateFrom"
              mask="YYYY-MM-DD"
              :options="optionsFromDate"
            >
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
    <div class="q-pa-xs q-mt-md q-ml-md q-mr-md">~</div>
    <q-input v-model="_dateTo" mask="####-##-##" outline>
      <template #prepend>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date
              v-model="_dateTo"
              mask="YYYY-MM-DD"
              :options="optionsToDate"
            >
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Data {
  from?: string
  to?: string
}

const props = defineProps<Data>()
const _dateFrom = ref(props.from)
const _dateTo = ref(props.to)

watch(
  () => props.from,
  () => {
    _dateFrom.value = props.from
  }
)

watch(
  () => props.to,
  () => {
    _dateTo.value = props.to
  }
)

const optionsFromDate = function (val: string) {
  if (_dateTo.value == undefined || _dateTo.value == '') {
    return true
  } else {
    return val <= _dateTo.value.replaceAll('-', '/')
  }
}

const optionsToDate = function (val: string) {
  if (_dateFrom.value == undefined || _dateFrom.value == '') {
    return true
  } else {
    return val >= _dateFrom.value.replaceAll('-', '/')
  }
}

const emit = defineEmits(['send-from-date', 'send-to-date'])

watch(_dateFrom, () => {
  emit('send-from-date', _dateFrom.value)
})

watch(_dateTo, () => {
  emit('send-to-date', _dateTo.value)
})
</script>

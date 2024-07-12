<template>
  <div class="row">
    <q-input v-model="_dateFromText" outline>
      <template #prepend>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date
              v-model="_dateFrom"
              mask="YYYY-MM-DDTHH:mm"
              :options="optionsFromDate"
            >
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
      <template #append>
        <q-icon name="access_time" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-time
              v-model="_dateFrom"
              mask="YYYY-MM-DDTHH:mm"
              :options="optionsFromDateTime"
            >
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-time>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
    <div class="q-pa-xs q-mt-md q-ml-md q-mr-md">~</div>
    <q-input v-model="_dateToText" outline>
      <template #prepend>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date
              v-model="_dateTo"
              mask="YYYY-MM-DDTHH:mm"
              :options="optionsToDate"
            >
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
      <template #append>
        <q-icon name="access_time" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-time
              v-model="_dateTo"
              mask="YYYY-MM-DDTHH:mm"
              :options="optionsToDateTime"
            >
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-time>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { dateUtil } from '@/utils/dateUtil'

interface Data {
  from?: string
  to?: string
}

const props = defineProps<Data>()
const _dateFrom = ref(props.from)
const _dateTo = ref(props.to)

const _dateFromText = ref()
const _dateToText = ref()

onMounted(() => {
  if (_dateFrom.value) {
    _dateFromText.value = dateUtil.getformatString(
      _dateFrom.value,
      'YYYY-MM-DD HH:mm'
    )
  }

  if (_dateTo.value) {
    _dateToText.value = dateUtil.getformatString(
      _dateTo.value,
      'YYYY-MM-DD HH:mm'
    )
  }
})

const optionsFromDate = function (val: string) {
  const _dateToDvs = _dateTo.value?.split('T')

  if (
    _dateTo.value == undefined ||
    _dateTo.value == '' ||
    _dateToDvs == undefined
  ) {
    return true
  } else {
    return val <= _dateTo.value.replaceAll('-', '/')
  }
}

const optionsToDate = function (val: string) {
  const _dateFromDvs = _dateFrom.value?.split('T')

  if (
    _dateFrom.value == undefined ||
    _dateFrom.value == '' ||
    _dateFromDvs == undefined
  ) {
    return true
  } else {
    return val >= _dateFromDvs[0].replaceAll('-', '/')
  }
}

const optionsFromDateTime = function (hr: number, min: number | null) {
  const _dateFromDvs = _dateFrom.value?.split('T')
  const _dateToDvs = _dateTo.value?.split('T')

  if (_dateFromDvs && _dateToDvs) {
    if (_dateFromDvs[0] == _dateToDvs[0]) {
      if (
        _dateToDvs[1].split(':')[0] == _dateFromDvs[1].split(':')[0] &&
        min != null
      ) {
        return (
          hr <= Number.parseInt(_dateToDvs[1].split(':')[0]) &&
          min <= Number.parseInt(_dateToDvs[1].split(':')[1])
        )
      } else {
        return hr <= Number.parseInt(_dateToDvs[1].split(':')[0])
      }
    } else {
      return true
    }
  } else {
    return true
  }
}

const optionsToDateTime = function (hr: number, min: number | null) {
  const _dateFromDvs = _dateFrom.value?.split('T')
  const _dateToDvs = _dateTo.value?.split('T')

  if (_dateFromDvs && _dateToDvs) {
    if (_dateFromDvs[0] == _dateToDvs[0]) {
      if (
        _dateToDvs[1].split(':')[0] == _dateFromDvs[1].split(':')[0] &&
        min != null
      ) {
        return (
          hr >= Number.parseInt(_dateFromDvs[1].split(':')[0]) &&
          min >= Number.parseInt(_dateFromDvs[1].split(':')[1])
        )
      } else {
        return hr >= Number.parseInt(_dateFromDvs[1].split(':')[0])
      }
    } else {
      return true
    }
  } else {
    return true
  }
}

const emit = defineEmits(['send-from-date', 'send-to-date'])

watch(_dateFrom, () => {
  if (_dateFrom.value) {
    _dateFromText.value = dateUtil.getformatString(
      _dateFrom.value,
      'YYYY-MM-DD HH:mm'
    )
  }

  emit('send-from-date', _dateFrom.value)
})

watch(_dateTo, () => {
  if (_dateTo.value) {
    _dateToText.value = dateUtil.getformatString(
      _dateTo.value,
      'YYYY-MM-DD HH:mm'
    )
  }

  emit('send-to-date', _dateTo.value)
})
</script>

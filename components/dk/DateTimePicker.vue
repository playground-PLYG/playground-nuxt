<template>
  <q-input v-model="_valueText" outline>
    <template #prepend>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date
            v-model="_datetime"
            :options="props.dateOptions"
            mask="YYYY-MM-DD HH:mm"
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
            v-model="_datetime"
            :options="props.timeOptions"
            mask="YYYY-MM-DD HH:mm"
          >
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
import { onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { dateUtil } from '@/utils/dateUtil'

interface Data {
  datetime?: string
  date?: string
  time?: string
  dateOptions?: readonly any[] | ((date: string) => boolean) | undefined
  timeOptions?:
    | ((
        hr: number,
        min: number | null,
        sec: number | null
      ) => boolean | null | undefined)
    | undefined
}

const $q = useQuasar()
const props = defineProps<Data>()
const _datetime = ref(props.datetime)
const _date = ref(props.date)
const _time = ref(props.time)

const _valueText = ref()
const emit = defineEmits(['send-date'])

watch(
  () => props.datetime,
  () => {
    _datetime.value = props.datetime
  }
)

watch(
  () => props.date,
  () => {
    _date.value = props.date
  }
)
watch(
  () => props.time,
  () => {
    _time.value = props.time
  }
)

onMounted(() => {
  if (_datetime.value) {
    //1.datetime이 있는 경우
    _valueText.value = dateUtil.getformatString(
      _datetime.value,
      'YYYY-MM-DD HH:mm'
    )
  } else if (_datetime.value == undefined && _date.value && _time.value) {
    //2. datetime이 없으면서 date와 time이 있는 경우
    _datetime.value = _date.value + 'T' + _time.value
    _valueText.value = dateUtil.getformatString(
      _date.value + _time.value,
      'YYYY-MM-DD HH:mm'
    )
  } else if ((_date.value && !_time.value) || (!_date.value && _time.value)) {
    //3. 그 외는 적용 불가
    $q.dialog({
      title: '알림',
      message: 'dateTimePicker parameter를 확인해 주세요.'
    })
  }
})

watch(_datetime, () => {
  if (_datetime.value) {
    _valueText.value = dateUtil.getformatString(
      _datetime.value,
      'YYYY-MM-DD HH:mm'
    )
  } else if (_datetime.value == undefined && _date.value && _time.value) {
    _valueText.value = dateUtil.getformatString(
      _date.value + _time.value,
      'YYYY-MM-DD HH:mm'
    )
  }

  emit('send-date', _datetime.value, 'dateValue')
})
</script>

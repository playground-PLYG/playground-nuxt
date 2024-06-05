<template>
  <div class="content q-pa-md q-gutter-md">
    <div class="title">
      <div class="text-h5">DatePicker 컴포넌트 샘플</div>
    </div>

    <q-separator inset />

    <div class="content-body">
      <div class="wrap-box">
        <div class="title q-pa-md">
          <div class="text-h6">datePicker</div>
        </div>
        <datePicker :date="param.date" @send-date="setDateValue" />
      </div>

      <div class="wrap-box">
        <div class="title q-pa-md">
          <div class="text-h6">timePicker</div>
        </div>
        <timePicker :date="param.time" @send-date="setTimeValue" />
      </div>

      <div class="wrap-box">
        <div class="title q-pa-md">
          <div class="text-h6">datetimePicker</div>
        </div>
        <dateTimePicker
          :datetime="param.dateTime"
          :date="param.date"
          :time="param.time"
          @send-date="setDateTimeValue"
        />
      </div>

      <div class="wrap-box">
        <div class="title q-pa-md">
          <div class="text-h6">dateFromToPicker</div>
        </div>
        <dateFromToPicker
          :from="param.dateFrom"
          :to="param.dateTo"
          @send-from-date="setDateFromValue"
          @send-to-date="setDateToValue"
        />
      </div>

      <div class="wrap-box">
        <div class="title q-pa-md">
          <div class="text-h6">dateTimeFromToPicker</div>
        </div>
        <dateTimeFromToPicker
          :from="param.dateFrom"
          :to="param.dateTo"
          @send-from-date="setDateTimeFromValue"
          @send-to-date="setDateTimeToValue"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import datePicker from '@/components/datePickerComponent.vue'
import timePicker from '@/components/timePickerComponent.vue'
import dateTimePicker from '@/components/dateTimePickerComponent.vue'
import dateFromToPicker from '@/components/dateFromToPickerComponent.vue'
import dateTimeFromToPicker from '@/components/dateTimeFromToPickerComponent.vue'

interface Data {
  date: string
  time: string
  dateTime: string
  dateFrom: string
  dateTo: string
}

const param = ref<Data>({
  date: '',
  time: '',
  dateTime: '',
  dateFrom: '',
  dateTo: ''
})

const setDateValue = (val: string) => {
  console.log('setDateValue :::: ', val)
}

const setTimeValue = (val: string) => {
  console.log('setDateValue :::: ', val)
}

const setDateTimeValue = (val: string) => {
  console.log('setDateValue :::: ', val)
}

const setDateFromValue = (val: string) => {
  console.log('setDateValue :::: ', val)
}

const setDateToValue = (val: string) => {
  console.log('setDateValue :::: ', val)
}

const setDateTimeFromValue = (val: string) => {
  console.log('setDateValue :::: ', val)
}

const setDateTimeToValue = (val: string) => {
  console.log('setDateValue :::: ', val)
}
</script>

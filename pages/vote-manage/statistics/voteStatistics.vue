<template>
  <q-dialog ref="dialogRef" @hide="">
    <q-layout container>
      <q-header>
        <q-toolbar class="bg-primary">
          <q-toolbar-title>투표통계</q-toolbar-title>
          <q-btn v-close-popup flat round dense icon="close" />
        </q-toolbar>
      </q-header>
      <q-card class="my-card" style="padding-top: 40px" flat bordered>
        <q-card-section>
          <div class="text-h6">투표제목 : {{ voteSubject }}</div>
        </q-card-section>
        <q-card-section>
          <div class="q-pa-md">
            <div
              v-for="(detail, i) in statResponse.staDetailList"
              :key="detail.questionSsno"
              :tag="detail.questionContents"
              class="row items-start q-gutter-md"
            >
              <Doughnut
                :data="doughChartData[i]"
                :options="doughChartOptions[i]"
              />
              <q-separator />
            </div>
            <div v-if="noCount" style="text-align: center">
              투표 건 수가 없습니다.
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-layout>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { type ApiResponse } from '../../../interface/server'

// ################# VUE Chart 관련 내용 이하 #################
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  ArcElement
} from 'chart.js'
ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, ArcElement)

let doughChartData = ref([
  {
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: [
      {
        label: 'example',
        data: [40, 20, 12, 50, 10]
      }
    ]
  }
])

let doughChartOptions = ref([
  {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Chart.js Doughnut Chart'
      }
    }
  }
])
// ############################################################

const { loading } = useQuasar()

let voteSsno = ref<number>(0)
let noCount = ref<boolean>(false)

const initFunc = (ssno: number, subject: string) => {
  console.log('voteStatistics initFunc statisticsSsno : ', ssno, subject)
  voteSsno.value = ssno
  settingStatisctics(ssno, subject)
}

interface statRequestType {
  voteSsno: number
  questionSsno?: number
  itemSsno?: number
  answerUserId?: string
}

let statRequest = ref<statRequestType>({
  voteSsno: 0,
  questionSsno: 0,
  itemSsno: 0,
  answerUserId: ''
})

interface statResponseType {
  totalVoteCount: number
  totalVoterCount: number
  questionCount: number
  voteSsno: number
  staDetailList: statDetailResponseType[]
}

interface statDetailResponseType {
  questionSsno: number
  questionContents: string
  staDetailDetailList: statDetailDetailResponseType[]
}

interface statDetailDetailResponseType {
  itemSsno: number
  itemCount: number
  itemName: string
}

let statResponse = ref<statResponseType>({
  totalVoteCount: 0,
  totalVoterCount: 0,
  questionCount: 0,
  voteSsno: 0,
  staDetailList: [
    {
      questionSsno: 0,
      questionContents: '',
      staDetailDetailList: [
        {
          itemSsno: 0,
          itemCount: 0,
          itemName: ''
        }
      ]
    }
  ]
})

const CHART_COLORS = {
  blue: 'rgb(54, 162, 235)',
  red: 'rgb(255, 99, 132)',
  purple: 'rgb(153, 102, 255)',
  green: 'rgb(75, 192, 192)',
  orange: 'rgb(255, 159, 64)',
  grey: 'rgb(201, 203, 207)',
  yellow: 'rgb(255, 205, 86)'
}

let voteSubject = ref<string>('')
const settingStatisctics = async (ssno: number, subject: string) => {
  loading.show()
  statRequest.value.voteSsno = ssno
  voteSubject.value = subject
  await $fetch<ApiResponse<statResponseType>>(
    '/playground/public/statistics/getVoteStatistics',
    {
      method: 'POST',
      body: JSON.stringify(statRequest.value)
    }
  )
    .then((res) => {
      statResponse.value = res.data
      console.log(
        'settingStatisctics :::::: statResponse.value : ',
        statResponse.value
      )

      if (statResponse.value.totalVoteCount == 0) {
        noCount.value = true
      } else {
        let chartList: any = []
        let chartOptions: any = []
        statResponse.value.staDetailList.forEach((sub) => {
          let chartLabel: string[] = []
          let chartValue: number[] = []
          let chartDataSetting = {}
          let chartOptionSetting = {}

          sub.staDetailDetailList.forEach((subsub) => {
            chartLabel.push(subsub.itemName)
            chartValue.push(subsub.itemCount)
          })

          chartDataSetting = {
            labels: chartLabel,
            datasets: [
              {
                label: '득표 수  ',
                data: chartValue,
                backgroundColor: Object.values(CHART_COLORS)
              }
            ]
          }

          chartOptionSetting = {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: sub.questionContents
              }
            }
          }

          chartList.push(chartDataSetting)
          chartOptions.push(chartOptionSetting)
        })

        //doughnut
        doughChartData.value = chartList
        doughChartOptions.value = chartOptions
      }
    })
    .catch((error) => {
      console.error(error)
    })
    .finally(() => {
      loading.hide()
    })
}

defineExpose({
  initFunc
})
</script>
<style lang="scss" scoped>
.my-card {
  width: 100%;
  .select {
    width: 200%;
  }
}
</style>

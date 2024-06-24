<template>
  <q-dialog ref="dialogRef" @hide="">
    <q-layout container>
      <q-header>
        <q-toolbar class="bg-primary">
          <q-toolbar-title>투표통계</q-toolbar-title>
          <q-btn v-close-popup flat round dense icon="close" />
        </q-toolbar>
      </q-header>
      <q-card class="my-card" flat bordered>
        <q-card-section>
          <div class="text-h5 text-weight-bold" style="padding-top: 40px">
            {{ voteSubject }}
          </div>
        </q-card-section>
        <q-card-section>
          <div class="q-pa-md example-row-equal-width">
            <div
              class="row"
              v-if="!noCount"
              v-for="(detail, i) in statResponse.staDetailList"
              :key="detail.questionSsno"
              :tag="detail.questionContents"
            >
              <div class="col">
                <div class="col text-h6 q-pb-xs text-weight-bold">
                  {{ detail.questionContents }}
                </div>
                <q-separator />
                <div class="col q-pb-sm">
                  <span class="text-subtitle1">1. 최고득표 항목명 </span>
                  <span class="text-caption"> (득표수, 득표율)</span>
                  <br />
                  <span class="q-pl-md text-weight-bold">
                    {{ detail.questionTopItemName }}
                  </span>
                  <span class="text-caption text-weight-bold">
                    {{
                      ' (' +
                      detail.questionTopItemCount +
                      ', ' +
                      detail.questionTopPercentage +
                      ')'
                    }}
                  </span>
                </div>
                <q-separator />
                <div class="col q-pb-xs">
                  <span class="text-subtitle1">2. 총 투표수 : </span>
                  <span class="text-weight-bold">{{
                    detail.questionTotalCount
                  }}</span>
                </div>
                <q-separator />
                <div class="col q-pb-xs">
                  <span class="text-subtitle1"
                    >3. 항목명 / 득표수 / 특표율
                  </span>
                  <br />
                  <div class="text-caption text-weight-bold q-pl-md">
                    <span v-for="ddtail in detail.staDetailDetailList">
                      -
                      {{
                        ddtail.itemName +
                        ' / (' +
                        ddtail.itemCount +
                        ') / (' +
                        (ddtail.itemCount / detail.questionTotalCount) * 100 +
                        '%)'
                      }}<br />
                    </span>
                  </div>
                </div>
                <q-separator />
              </div>
              <div class="col">
                <Doughnut
                  :data="doughChartData[i]"
                  :options="doughChartOptions[i]"
                />
              </div>
            </div>
            <div v-else-if="noCount" style="text-align: center">
              투표 건 수가 없습니다.
            </div>
            <!-- <div v-if="noCount" style="text-align: center">
              투표 건 수가 없습니다.
            </div> -->
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
  questionTotalCount: number
  questionTopItemName?: string
  questionTopItemCount?: number
  questionTopPercentage?: string
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
      questionTotalCount: 1,
      questionTopItemName: '',
      questionTopItemCount: 0,
      questionTopPercentage: '0%',
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
        noCount.value = false
        let chartList: any = []
        let chartOptions: any = []
        statResponse.value.staDetailList.forEach((sub, idx) => {
          let chartLabel: string[] = []
          let chartValue: number[] = []
          let chartDataSetting = {}
          let chartOptionSetting = {}

          let itemTotalCount: number = 0
          let qTopItemName: string = ''
          let qTopItemNameArr: string[] = []
          let qTopItemCount: number = -1

          sub.staDetailDetailList.forEach((subsub) => {
            chartLabel.push(subsub.itemName)
            chartValue.push(subsub.itemCount)
            itemTotalCount += subsub.itemCount
            if (subsub.itemCount > qTopItemCount) {
              qTopItemCount = subsub.itemCount
            }
          })

          sub.staDetailDetailList.forEach((top) => {
            if (qTopItemCount == top.itemCount) {
              qTopItemNameArr.push(top.itemName)
            }
          })

          sub.questionTotalCount = itemTotalCount
          sub.questionTopItemCount = qTopItemCount

          sub.questionTopPercentage =
            String((qTopItemCount / itemTotalCount) * 100) + '%'

          if (qTopItemNameArr.length > 1) {
            qTopItemNameArr.forEach((na) => {
              qTopItemName += na + ','
            })
            sub.questionTopItemName = qTopItemName.substring(
              0,
              qTopItemName.length - 1
            )
          } else {
            sub.questionTopItemName = qTopItemNameArr[0]
          }

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
            responsive: true, // 그래프가 브라우저 크기에 맞게 반응하도록 설정
            maintainAspectRatio: false, // 그래프의 가로세로 비율 유지 여부 설정
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  boxWidth: 4,
                  padding: 15,
                  usePointStyle: true,
                  pointStyle: 'circle',
                  font: {
                    size: 10
                  }
                }
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
}
</style>

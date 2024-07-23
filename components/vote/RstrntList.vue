<template>
  <!-- 식당 팝업 start -->
  <div>
    <dk-dialog
      header-label="식당 선택"
      v-bind="$attrs"
      :footer-visible="false"
      @close-callback="dialogCloseCallback"
    >
      <template #body>
        <div class="dialog-body">
          <div class="row">
            <dk-select
              v-model="selectRstrntKind"
              :options="selectRstrntKindOption"
              class="col-4 q-pr-sm"
              label="종류"
            />
            <dk-input
              v-model="inputRstrntName"
              label="식당"
              class="col-8"
              :max-length="20"
            >
              <template #append>
                <template v-if="inputRstrntName">
                  <q-icon
                    name="cancel"
                    class="cursor-pointer"
                    @click.stop.prevent="fn_resetSearchParam"
                  />
                </template>
                <q-icon name="search" @click="fn_searchRstrnt" />
              </template>
            </dk-input>
          </div>
          <q-separator spaced="12px" />

          <div id="scroll-target">
            <div id="scroll-target-id" style="overflow: auto">
              <q-infinite-scroll
                scroll-target="#scroll-target-id"
                @load="onLoad"
              >
                <div
                  v-for="(resData, index) in restaurantData"
                  :key="index"
                  class="rstrnt-list"
                >
                  <q-card flat bordered class="q-mb-sm">
                    <q-card-section horizontal class="rstrnt-card">
                      <q-img
                        class="col"
                        :ratio="1"
                        :src="
                          resData.imageFileIds
                            ? imageUtil.getImageUrl(resData.imageFileIds[0])
                            : '/icon/no-image.png'
                        "
                        @click="fn_selectRstrnt(resData)"
                      />
                    </q-card-section>

                    <q-separator />

                    <q-card-actions class="justify-flex-start">
                      <dk-btn
                        flat
                        round
                        color="blue"
                        icon="info"
                        @click="fn_rstrntDetail(resData)"
                      />
                      {{ resData.restaurantName }}
                    </q-card-actions>
                  </q-card>
                </div>
                <template #loading>
                  <div class="row justify-center q-my-md">
                    <q-spinner-dots color="primary" size="40px" />
                  </div>
                </template>
              </q-infinite-scroll>
            </div>
          </div>
        </div>
      </template>
    </dk-dialog>

    <!-- 식당 팝업 end -->

    <!-- 식당 상세 팝업 start -->

    <vote-rstrnt-detail
      v-model="rstrntDetailOpen"
      @close-callback="rstrntDetailCloseCallback"
    />

    <!-- 식당 상세 팝업 end -->
  </div>
</template>

<!-- 함수정의 -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { commUtil } from '~/utils/comm'
import { type ApiResponse, type Code } from '@/interface/server'
import { codeUtil } from '@/utils/code'
import { imageUtil } from '~/utils/image'

const emit = defineEmits([
  'close-callback',
  'select-rstrnt',
  'show-rstrnt-detail',
  'close-detail-callback'
])

const dialogCloseCallback = () => {
  emit('close-callback')
}

/** 식당리스트 조회 */
interface RestaurantData {
  restaurantSerialNo?: number
  restaurantName: string
  restaurantKindCode: string
  restaurantDistance?: number
  la: string
  lo: string
  kakaoMapId: string
  imageFileIds?: number[]
  firstImageUrl?: string
}

const restaurantData = ref<RestaurantData[]>([
  {
    restaurantSerialNo: -1,
    restaurantName: '',
    restaurantKindCode: '',
    restaurantDistance: -1,
    la: '',
    lo: '',
    kakaoMapId: '',
    imageFileIds: []
  }
])

const totalRestaurantData = ref<RestaurantData[]>([
  {
    restaurantSerialNo: -1,
    restaurantName: '',
    restaurantKindCode: '',
    restaurantDistance: -1,
    la: '',
    lo: '',
    kakaoMapId: '',
    imageFileIds: []
  }
])

const searchParam = ref<RestaurantData>({
  restaurantKindCode: '',
  restaurantName: '',
  kakaoMapId: '',
  la: '',
  lo: ''
})

onMounted(() => {
  fn_getCodeList()
  fn_getRstrntList()
})

const totalRstrntLength = ref<number>(0)

// 추후 20으로 바꾸기
const initOffsetCount = ref<number>(10)

const fn_getRstrntList = async () => {
  await $fetch<ApiResponse<RestaurantData[]>>(
    '/playground/public/restaurant/getRstrntList',
    {
      method: 'POST',
      body: JSON.stringify(searchParam.value)
    }
  )
    .then((result) => {
      totalRestaurantData.value = result.data
      totalRstrntLength.value = totalRestaurantData.value.length

      const offsetData: RestaurantData[] = []
      result.data.forEach((obj, index) => {
        if (index < initOffsetCount.value) {
          offsetData.push(obj)
        }
      })
      restaurantData.value = offsetData
    })
    .catch((error) => {
      console.error(error)
    })
}

const restaurantKindCodeOptions = ref<Code[]>([])
const selectRstrntKind = ref({
  value: '',
  label: '전체',
  kindCode: ''
})
interface RstrntKind {
  label: string
  value: string
  kindCode: string
}

const selectRstrntKindOption = ref<RstrntKind[]>([])
const inputRstrntName = ref<string>()
const fn_getCodeList = async () => {
  restaurantKindCodeOptions.value = await codeUtil.getCodeGroupList(
    'RSTRNT_KND_CODE'
  )

  selectRstrntKindOption.value = [
    {
      value: '',
      label: '전체',
      kindCode: ''
    }
  ]
  restaurantKindCodeOptions.value.forEach((cd) => {
    selectRstrntKindOption.value.push({
      label: cd.codeName,
      value: cd.code,
      kindCode: cd.code
    })
  })
}

const fn_searchRstrnt = () => {
  rstrntDetailOpen.value = false
  const { kindCode } = selectRstrntKind.value
  searchParam.value = {
    restaurantName: inputRstrntName.value ? inputRstrntName.value : '',
    restaurantKindCode: kindCode,
    kakaoMapId: '',
    la: '',
    lo: ''
  }
  fn_getRstrntList()
}

const fn_resetSearchParam = () => {
  inputRstrntName.value = ''
  selectRstrntKind.value = {
    value: '',
    label: '전체',
    kindCode: ''
  }
}

let criteriaCount: number = 20
const onLoad = (index: number, done: (stop?: boolean) => void) => {
  setTimeout(() => {
    const items: RestaurantData[] = []
    if (initOffsetCount.value < totalRstrntLength.value) {
      for (let i = initOffsetCount.value; i < criteriaCount; i++) {
        items.push(totalRestaurantData.value[i])
      }
      items.forEach((iem) => restaurantData.value.push(iem))
      initOffsetCount.value += 10
      criteriaCount =
        criteriaCount + 10 > totalRstrntLength.value
          ? totalRstrntLength.value
          : criteriaCount + 10
    } else {
      done(true)
    }
    done()
  }, 2000)
}

const fn_rstrntDetail = (rstrnt: RestaurantData) => {
  //rstrntDetailOpen.value = true
  emit('show-rstrnt-detail', rstrnt.restaurantSerialNo)
}

const selectRstrnt = ref<RestaurantData>()
const fn_selectRstrnt = (rstrnt: RestaurantData) => {
  selectRstrnt.value = rstrnt
  commUtil.confirm({
    message: '해당 식당을 선택하시겠습니까?',
    callbackFn: fn_confirmCallback
  })
}

const fn_confirmCallback = (isConfirm: boolean) => {
  if (isConfirm) {
    emit('select-rstrnt', selectRstrnt.value)
  } else {
    return
  }
}

const rstrntDetailOpen = ref<boolean>(false)

const rstrntDetailCloseCallback = () => {
  rstrntDetailOpen.value = false
}
</script>

<!-- css -->
<style lang="scss" scoped>
.rstrnt-card {
  max-height: 100px;
}

.dialog-body {
  height: calc(100dvh - 80px);
}

#scroll-target {
  height: calc(100dvh - 150px);
}

#scroll-target-id {
  max-height: 100%;
}
</style>

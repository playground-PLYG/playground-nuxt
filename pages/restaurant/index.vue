<template>
  <div>
    <div class="content q-pa-md q-gutter-md">
      <div class="title">
        <div class="text-h4"><q-icon name="rss_feed" /> 식당 목록</div>
      </div>

      <div class="search">
        <q-form
          @submit="fn_getRestaurantList"
          @reset="fn_resetRestaurantSearchArea"
        >
          <q-card flat class="search-card">
            <q-card-section class="row q-pa-none">
              <div class="row full-width q-px-lg q-pb-lg q-pt-md">
                <div
                  class="text-grey-8 col-md-4 col-lg-4 col-xs-12 col-sm-12 q-pr-md q-pt-sm"
                >
                  <q-select
                    v-model="restaurantSrchReq.restaurantKindCode"
                    outlined
                    :options="restaurantKindCodeSearchOptions"
                    option-label="codeName"
                    option-value="code"
                    label="식당종류"
                    round
                    dense
                    flat
                    class="select"
                    emit-value
                    map-options
                  />
                </div>
                <div
                  class="text-grey-8 col-md-4 col-lg-4 col-xs-12 col-sm-12 q-pr-md q-pt-sm"
                >
                  <q-input
                    v-model="restaurantSrchReq.restaurantName"
                    outlined
                    label="식당명"
                    round
                    dense
                    flat
                    class="input"
                  />
                </div>

                <div
                  class="text-grey-8 col-md-4 col-lg-4 col-xs-12 col-sm-12 q-pr-md q-pt-sm"
                >
                  <div class="row full-width justify-end">
                    <div class="q-pl-xs">
                      <q-btn
                        push
                        class="button"
                        color="green-6"
                        label="초기화"
                        type="reset"
                      />
                    </div>
                    <div class="q-pl-xs">
                      <q-btn
                        push
                        class="button"
                        color="green-6"
                        label="조회"
                        type="submit"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-form>
      </div>

      <div class="toolbar-area">
        <q-card flat>
          <q-card-section class="row q-pa-none">
            <div class="row full-width q-px-md q-py-xs justify-end">
              <div class="row q-py-xs toolbar-box">
                <div
                  v-show="isRestaurantSelectMode"
                  class="q-pl-md q-py-xs flex inline"
                >
                  <q-btn
                    push
                    class="button"
                    color="red-7"
                    label="삭제"
                    @click="fn_removeRestaurantList"
                  />
                </div>

                <q-separator
                  v-show="isRestaurantSelectMode"
                  inset
                  vertical
                  class="q-ml-sm flex inline"
                />

                <div class="flex inline">
                  <q-toggle
                    v-model="isRestaurantSelectMode"
                    checked-icon="check"
                    color="green"
                    unchecked-icon="clear"
                    size="lg"
                    left-label
                  />
                </div>
              </div>

              <q-separator inset vertical class="q-mx-sm flex inline" />

              <div class="row q-py-sm">
                <div class="flex inline">
                  <q-btn
                    push
                    class="button"
                    color="blue-6"
                    label="추가"
                    @click="fn_openRestaurantAddPopup"
                  />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="content-body">
        <div
          :class="[
            'row justify-center q-gutter-sm',
            isRestaurantSelectMode ? 'restaurant-select-mode' : ''
          ]"
        >
          <q-intersection
            v-for="(restaurant, restaurantIndex) in restaurantResList"
            :key="restaurantIndex"
            class="q-ma-sm card-restaurant cursor-pointer"
          >
            <q-card
              flat
              bordered
              @click="fn_selectRestaurant(restaurant.restaurantSerialNo)"
            >
              <q-card-section class="q-pa-none q-pb-xs">
                <div class="card-img">
                  <q-img
                    :src="restaurant.imageUrl"
                    class="fit"
                    :rato="1"
                    :img-style="{ borderRadius: '2px' }"
                    no-native-menu
                  >
                    <q-checkbox
                      v-show="isRestaurantSelectMode"
                      v-model="restaurant.isSelected"
                      class="absolute-full text-subtitle2 flex flex-center"
                      size="250px"
                      checked-icon="task_alt"
                      unchecked-icon="highlight_off"
                    />
                  </q-img>
                </div>
              </q-card-section>

              <q-separator inset />

              <q-card-section>
                <div class="text-subtitle1">
                  {{ restaurant.restaurantName }}
                </div>
              </q-card-section>
            </q-card>
          </q-intersection>
        </div>
      </div>
    </div>

    <div class="popup">
      <q-dialog
        v-model="isShowRestaurantAddPopup"
        :maximized="isMobile"
        :full-width="isMobile"
      >
        <q-layout
          container
          :style="!isMobile ? { width: '1000px', 'max-width': '80vw' } : {}"
        >
          <q-header>
            <q-toolbar class="bg-primary">
              <q-toolbar-title>식당 추가</q-toolbar-title>
              <q-btn v-close-popup flat round dense icon="close" />
            </q-toolbar>
          </q-header>

          <q-page-container class="bg-white">
            <q-page padding>
              <q-stepper
                v-model="restaurantAddStep"
                keep-alive
                vertical
                color="primary"
                animated
              >
                <q-step
                  :name="1"
                  title="식당 선택"
                  icon="settings"
                  :done="addRestaurant.restaurantName != ''"
                >
                  <map-search
                    :location="currentLocationCoordinate"
                    keyword="맛집"
                    :searchRadius="300"
                    @marker-click="fn_selectedAddRestaurant"
                  />
                </q-step>

                <q-step
                  :name="2"
                  title="식당정보 확인"
                  icon="create_new_folder"
                  :done="restaurantAddStep > 2"
                >
                  <q-field label="식당명" stack-label readonly>
                    <template v-slot:control>
                      <div class="self-center full-width no-outline">
                        {{ addRestaurant.restaurantName }}
                      </div>
                    </template>
                  </q-field>

                  <q-field label="식당유형" stack-label readonly>
                    <template v-slot:control>
                      <div class="self-center full-width no-outline">
                        {{ addRestaurant.restaurantKindCodeName }}
                      </div>
                    </template>
                  </q-field>

                  <q-field label="식당거리" stack-label readonly>
                    <template v-slot:control>
                      <div class="self-center full-width no-outline">
                        {{ addRestaurant.restaurantDistance }} m
                      </div>
                    </template>
                  </q-field>

                  <q-stepper-navigation>
                    <q-btn
                      flat
                      @click="restaurantAddStep = 1"
                      color="primary"
                      label="다시선택"
                      class="q-ml-sm"
                    />
                    <q-btn
                      @click="restaurantAddStep = 3"
                      color="primary"
                      label="다음"
                    />
                  </q-stepper-navigation>
                </q-step>

                <q-step :name="3" title="식당 이미지 업로드" icon="add_comment">
                  <image-upload
                    @fileDeleted="fn_fileDeleted"
                    @fileUploaded="fn_fileUploaded"
                    @fileRemoved="fn_fileRemoved"
                  />

                  <q-stepper-navigation>
                    <q-btn color="primary" label="Finish" />
                    <q-btn
                      flat
                      @click="restaurantAddStep = 2"
                      color="primary"
                      label="Back"
                      class="q-ml-sm"
                    />
                  </q-stepper-navigation>
                </q-step>
              </q-stepper>
            </q-page>
          </q-page-container>
        </q-layout>
      </q-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { type ApiResponse, type Code } from '@/interface/server'
import { codeUtil } from '@/utils/code'
import { imageUtil } from '~/utils/image'

const { loading, platform } = useQuasar()

/* 식당 */
interface Restaurant {
  restaurantSerialNo: number
  restaurantName: string
  restaurantKindCode: string
  restaurantKindCodeName?: string
  restaurantDistance: number
  la: string
  lo: string
  kakaoMapId: string
  imageFileId: number | null
  imageUrl: string | undefined
  isSelected?: boolean
}

/* 메뉴 */
interface _Menu {
  restaurantSerialNo: number
  restaurantMenuSerialNo: number
  menuName: string
  menuPrice: string
  menuHashtagList?: HashtagData[]
}

interface HashtagData {
  hashtagId: string
  restaurantSerialNo: number
  restaurantMenuSerialNo: number
  hashtagSerialNo: number
  hashtagName: string
}

const restaurantSrchReq = ref<
  Pick<Restaurant, 'restaurantName' | 'restaurantKindCode'>
>({
  restaurantName: '',
  restaurantKindCode: ''
})

const restaurantResList = ref<Restaurant[]>([])

const restaurantKindCodeOptions = ref<Code[]>([])
const restaurantKindCodeSearchOptions = ref<Code[]>([])
const currentLocationCode = ref<Code[]>([])

const currentLocationCoordinate = ref<{ x: number; y: number }>()

const _selectedRestaurant = ref<Restaurant>({
  restaurantSerialNo: -1,
  restaurantName: '',
  restaurantKindCode: '',
  la: '',
  lo: '',
  kakaoMapId: '',
  imageFileId: null,
  imageUrl: undefined,
  restaurantDistance: -1
})

const isShowRestaurantAddPopup = ref<boolean>(false)

const restaurantAddStep = ref<number>(1)

const addRestaurant = ref<Omit<Restaurant, 'restaurantSerialNo' | 'imageUrl'>>({
  restaurantName: '',
  restaurantKindCode: '',
  restaurantDistance: -1,
  la: '',
  lo: '',
  kakaoMapId: '',
  imageFileId: null
})

const isRestaurantSelectMode = ref<boolean>(false)
const isRestaurantAddPopupPlaceSelected = ref<boolean>(false)
const isMobile = ref<boolean | undefined>(platform.is.mobile)

watch(isRestaurantSelectMode, (newValue) => {
  if (newValue && restaurantResList.value.length > 0) {
    restaurantResList.value.forEach(
      (restaurant) => (restaurant.isSelected = false)
    )
  }
})

const restaurantSelectedIdList = computed(() => {
  return restaurantResList.value
    .filter((restaurant) => restaurant.isSelected)
    .map((restaurant) => ({
      restaurantSerialNo: restaurant.restaurantSerialNo
    }))
})

onMounted(() => {
  fn_getCodeList()
  fn_getRestaurantList()
})

const fn_getCodeList = async (): Promise<void> => {
  loading.show()

  restaurantKindCodeOptions.value = await codeUtil.getCodeGroupList(
    'RSTRNT_KND_CODE'
  )

  restaurantKindCodeSearchOptions.value = [
    {
      code: '',
      codeName: '전체',
      upperCode: '',
      order: 0
    },
    ...restaurantKindCodeOptions.value
  ]

  currentLocationCode.value = await codeUtil.getCodeGroupList(
    'CURRENT_LOCATION'
  )

  currentLocationCoordinate.value = currentLocationCode.value.reduce(
    (acc: { x: number; y: number }, codeObj: Code) => {
      if (codeObj.code == 'x' || codeObj.code == 'y') {
        acc[codeObj.code] = Number(codeObj.codeName)
      }

      return acc
    },
    {} as { x: number; y: number }
  )

  loading.hide()
}

const fn_getRestaurantList = async (): Promise<void> => {
  isRestaurantSelectMode.value = false

  loading.show()

  await $fetch<ApiResponse<Restaurant[]>>(
    '/playground/public/restaurant/getRstrntList',
    {
      method: 'POST',
      body: JSON.stringify(restaurantSrchReq.value)
    }
  )
    .then((result) => {
      if (result.data.length <= 0) {
        //TODO 결과 없음 표시
      } else {
        result.data.forEach((restaurant) => {
          restaurant.isSelected = false
          restaurant.imageUrl = restaurant.imageFileId
            ? imageUtil.getImageUrl(restaurant.imageFileId)
            : '/icon/no-image.png'
        })

        restaurantResList.value = result.data
      }
    })
    .catch((error) => {
      console.error(error)
    })

  loading.hide()
}

const fn_removeRestaurantList = async (): Promise<void> => {
  console.debug(restaurantSelectedIdList.value)

  if (restaurantSelectedIdList.value.length <= 0) {
    alert('삭제할 식당을 선택해주세요.')
    return
  }

  if (confirm('선택한 식당들을 삭제하시겠습니까?')) {
    loading.show()

    await $fetch<ApiResponse<Restaurant[]>>(
      '/playground/public/restaurant/removeRstrnt',
      {
        method: 'POST',
        body: JSON.stringify(restaurantSelectedIdList.value)
      }
    )
      .then((_result) => {
        alert('삭제되었습니다.')
        fn_getRestaurantList()
      })
      .catch((error) => {
        console.error(error)
      })

    loading.hide()
  }
}

const fn_resetRestaurantSearchArea = () => {
  restaurantSrchReq.value = {
    restaurantKindCode: '',
    restaurantName: ''
  }
}

const fn_openRestaurantAddPopup = () => {
  // 상태 체크 및 초기화 addRestaurant
  isShowRestaurantAddPopup.value = !isShowRestaurantAddPopup.value
  isRestaurantAddPopupPlaceSelected.value = false
}

const fn_selectRestaurant = (restaurantSerialNo: number) => {
  if (!isShowRestaurantAddPopup.value) {
    console.log(restaurantSerialNo)
  }
}

const fn_selectedAddRestaurant = async (
  selectedPlace: kakao.maps.services.PlacesSearchResultItem
) => {
  console.debug('>>> selectedPlace', selectedPlace)

  loading.show()

  await $fetch<ApiResponse<Restaurant | null>>(
    '/playground/public/restaurant/getIsExist',
    {
      method: 'POST',
      body: JSON.stringify({
        restaurantName: selectedPlace.place_name,
        kakaoMapId: selectedPlace.id
      })
    }
  )
    .then((result) => {
      if (result.data != null) {
        let existRestaurantName = ''

        if (selectedPlace.place_name != result.data.restaurantName) {
          existRestaurantName = `'${result.data.restaurantName}'으로 `
        }

        alert(
          `'${selectedPlace.place_name}'은(는) ${existRestaurantName}이미 등록된 식당입니다.`
        )
      } else {
        const restaurantKindCode = restaurantKindCodeOptions.value.find(
          (code: Code) =>
            code.codeName == selectedPlace.category_name.substring(6, 8)
        )

        addRestaurant.value.restaurantName = selectedPlace.place_name

        addRestaurant.value.restaurantKindCode = restaurantKindCode?.code
          ? restaurantKindCode.code
          : ''

        addRestaurant.value.restaurantKindCodeName = restaurantKindCode?.code
          ? restaurantKindCode.codeName
          : ''
        addRestaurant.value.restaurantDistance = Number(selectedPlace.distance)
        addRestaurant.value.la = selectedPlace.y
        addRestaurant.value.lo = selectedPlace.x
        addRestaurant.value.kakaoMapId = selectedPlace.id

        isRestaurantAddPopupPlaceSelected.value = true
        restaurantAddStep.value = 2
      }
    })
    .catch((error) => {
      console.error(error)
    })

  loading.hide()
}

const fn_fileDeleted = (fileId: string) => {
  console.debug('fileDeleted fileId : ', fileId)
}

const fn_fileUploaded = (fileId: string) => {
  console.debug('fileUploaded fileId : ', fileId)
}

const fn_fileRemoved = (fileId: string) => {
  console.debug('fileRemoved fileId : ', fileId)
}
</script>

<style lang="scss" scoped>
.content {
  .search {
    .search-card {
      border: 1px solid lightgrey;
      border-radius: 5px;
    }
  }

  .toolbar-area {
    .toolbar-box {
      border: 1px solid lightgrey;
      border-radius: 5px;
    }
  }

  .content-body {
    .card-restaurant {
      height: 400px;
      width: 100%;
      max-width: 300px;

      .card-img {
        width: 100%;
        height: 280px;
      }
    }
  }
}
</style>

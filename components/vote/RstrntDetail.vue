<template>
  <!-- 식당 상세팝업 start -->
  <dk-dialog
    header-label="식당상세"
    :footer-visible="false"
    @close-callback="detailDialogCloseCallback"
  >
    <template #body>
      <div class="dialog-body">
        <!-- 편집 start -->
        <q-splitter v-model="splitterModel" style="height: 100%">
          <template #before>
            <q-tabs v-model="defaultTab" vertical class="text-black">
              <q-tab name="information" label="정보" icon="info" />
              <q-tab name="menu" label="메뉴" icon="menu_book" />
            </q-tabs>
          </template>
          <template #after>
            <q-tab-panels
              v-model="defaultTab"
              animated
              swipeable
              vertical
              transition-prev="jump-up"
              transition-next="jump-up"
            >
              <q-tab-panel name="information">
                <div class="text-h5 q-mb-md">기본정보</div>
                <div class="detail-info q-mb-md">
                  <q-field label="식당명" stack-label readonly>
                    <template #control>
                      <div class="self-center full-width no-outline">
                        {{ restaurantDetail.restaurantName }}
                      </div>
                    </template>
                  </q-field>
                  <q-field label="식당유형" stack-label readonly>
                    <template #control>
                      <div class="self-center full-width no-outline">
                        {{ restaurantDetail.restaurantKindCodeName }}
                      </div>
                    </template>
                  </q-field>
                  <q-field label="식당거리" stack-label readonly>
                    <template #control>
                      <div class="self-center full-width no-outline">
                        {{ restaurantDetail.restaurantDistance }} m
                      </div>
                    </template>
                  </q-field>
                </div>
                <div class="detail-map q-mb-md">
                  <map-location
                    :location="currentLocationCoordinate"
                    :place="restaurantDetailMap"
                  />
                </div>

                <div class="detail-img">
                  <q-img
                    :src="restaurantDetail.imageUrl"
                    class="fit image"
                    :ratio="1"
                    :img-style="{
                      borderRadius: '2px',
                      border: '1px solid lightgray'
                    }"
                    no-native-menu
                  >
                    <div
                      v-show="isOneMoreImg"
                      class="absolute-left"
                      @click="fn_imgBtnClick('left')"
                    >
                      <q-icon name="chevron_left" style="padding-top: 100%" />
                    </div>
                    <div
                      v-show="isOneMoreImg"
                      class="absolute-right"
                      @click="fn_imgBtnClick('right')"
                    >
                      <q-icon name="chevron_right" style="padding-top: 100%" />
                    </div>
                  </q-img>
                </div>
              </q-tab-panel>

              <q-tab-panel name="menu">
                <div class="text-h5 q-mb-md">메뉴</div>
                <q-intersection
                  v-for="(menu, menuIndex) in restaurantDetail.menuList"
                  :key="menuIndex"
                  class="q-ma-sm card-menu"
                >
                  <q-card class="my-card" flat bordered>
                    <!-- <img src="https://cdn.quasar.dev/img/parallax2.jpg" /> -->
                    <q-list>
                      <q-item clickable>
                        <q-item-section avatar>
                          <q-icon color="red" name="restaurant_menu" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ menu.menuName }}</q-item-label>
                          <q-item-label caption
                            >{{ menu.menuPrice }}원</q-item-label
                          >
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card>
                </q-intersection>
                <!--
                  <q-intersection class="q-ma-sm card-menu">
                    <q-card class="my-card" flat bordered>
                      <q-list>
                        <q-item clickable>
                          <q-item-section avatar>
                            등록된 메뉴가 없습니다.
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-card>
                  </q-intersection>
                -->
              </q-tab-panel>
            </q-tab-panels>
          </template>
        </q-splitter>

        <!-- 편집 end -->
      </div>
    </template>
  </dk-dialog>
  <!-- 식당 상세팝업 end -->
</template>

<!-- 함수정의 -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { type ApiResponse, type Code } from '@/interface/server'
import { codeUtil } from '@/utils/code'
import { imageUtil } from '~/utils/image'
import { commUtil } from '~/utils/comm'

const { loading } = useQuasar()

const defaultTab = ref<string>('information')
const splitterModel = ref<number>(20)
const currentLocationCoordinate = ref<{ x: number; y: number }>()

/* 식당 상세 */
interface RestaurantDetail {
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
  menuList: Menu[] | []
  fileList: imgFileInfo[] | []
}

/* 식장 지도 */
interface RestaurantDetailMap {
  placeName: string
  kakaoMapId: string
  la: string
  lo: string
}

/* 메뉴 */
interface Menu {
  restaurantSerialNo: number
  restaurantMenuSerialNo: number
  menuName: string
  menuPrice: number
}

/* 이미지파일 serial No */
interface imgFileInfo {
  fileSerialNo: number
  restaurantSerialNo: number
}

const restaurantDetail = ref<RestaurantDetail>({
  restaurantSerialNo: -1,
  restaurantName: '',
  restaurantKindCode: '',
  restaurantDistance: -1,
  la: '',
  lo: '',
  kakaoMapId: '',
  imageFileId: null,
  imageUrl: '/icon/no-image.png',
  menuList: [
    {
      restaurantSerialNo: -1,
      restaurantMenuSerialNo: -1,
      menuName: '',
      menuPrice: 0
    }
  ],
  fileList: []
})

const restaurantDetailMap = ref<RestaurantDetailMap>({
  placeName: '',
  kakaoMapId: '',
  la: '',
  lo: ''
})

const restaurantKindCodeOptions = ref<Code[]>([])
const restaurantKindCodeSearchOptions = ref<Code[]>([])
const currentLocationCode = ref<Code[]>([])

onMounted(() => {
  fn_getCodeList()
})

const emit = defineEmits(['close-detail-callback'])

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

const fn_getRstrntDetail = async (ssno: number) => {
  await $fetch<ApiResponse<RestaurantDetail>>(
    '/playground/public/restaurant/getRstrntDetail',
    {
      method: 'POST',
      body: JSON.stringify({ restaurantSerialNo: ssno })
    }
  )
    .then((result: ApiResponse<RestaurantDetail>) => {
      restaurantDetail.value = result.data
      restaurantDetail.value.restaurantKindCodeName = restaurantDetail.value
        .restaurantKindCode
        ? restaurantKindCodeOptions.value.filter(
            (code) => code.code == restaurantDetail.value.restaurantKindCode
          )[0].codeName
        : ''

      const { restaurantName, kakaoMapId, la, lo } = result.data

      restaurantDetailMap.value = {
        placeName: restaurantName,
        kakaoMapId,
        la,
        lo
      }

      fn_setImgUrl()
    })
    .catch((error) => {
      console.error(error)
      commUtil.alert({
        message: error.errorMessage
      })
    })
}

const imageUrls = ref<string[]>([])
const isOneMoreImg = ref<boolean>(false)
const fn_setImgUrl = () => {
  imageUrls.value = []
  restaurantDetail.value.fileList.forEach((obj) => {
    imageUrls.value.push(imageUtil.getImageUrl(obj.fileSerialNo))
  })

  restaurantDetail.value.imageUrl = imageUrls.value[0]
  if (imageUrls.value.length > 1) {
    isOneMoreImg.value = true
  } else {
    isOneMoreImg.value = false
  }

  fn_getMenuList()
}

const fn_getMenuList = async () => {
  await $fetch<ApiResponse<Menu[]>>(
    '/playground/public/restaurant/getRstrntMenuList',
    {
      method: 'POST',
      body: JSON.stringify({
        restaurantSerialNo: restaurantDetail.value.restaurantSerialNo
      })
    }
  )
    .then((result) => {
      restaurantDetail.value.menuList = []
      restaurantDetail.value.menuList = result.data
    })
    .catch((error) => {
      console.error(error)
      commUtil.alert({
        message: error.errorMessage
      })
    })
}

const detailDialogCloseCallback = () => {
  imgIndx.value = 0
  fn_getCodeList()
  emit('close-detail-callback')
}

const imgIndx = ref<number>(0)
const fn_imgBtnClick = (data: string) => {
  if (data == 'left') {
    if (imgIndx.value == 0) {
      imgIndx.value = imageUrls.value.length - 1
    } else if (imgIndx.value == imageUrls.value.length - 1) {
      imgIndx.value = imgIndx.value - 1
    } else {
      imgIndx.value = imgIndx.value - 1
    }
  } else if (data == 'right') {
    if (imgIndx.value == 0) {
      imgIndx.value = imgIndx.value + 1
    } else if (imgIndx.value == imageUrls.value.length - 1) {
      imgIndx.value = 0
    } else {
      imgIndx.value = imgIndx.value + 1
    }
  }

  restaurantDetail.value.imageUrl = imageUrls.value[imgIndx.value]
}

defineExpose({
  fn_getRstrntDetail
})
</script>

<!-- css -->
<style lang="scss" scoped>
.dialog-body {
  height: calc(100dvh - 80px);
}

.detail-map {
  border: 1px solid lightgray;
}
</style>

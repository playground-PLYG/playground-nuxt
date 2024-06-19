<template>
  <div :class="['page-wrap', isMobile ? 'mobile' : '']">
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
            isMobile ? 'col' : 'row',
            'justify-center q-gutter-sm',
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
        id="restaurantAddPopup"
        ref="restaurantAddPopup"
        v-model="isShowRestaurantAddPopup"
        :maximized="isMobile"
        :full-width="isMobile"
        class="add"
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
                  icon="add_location"
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
                  icon="info"
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
                      label="다시 선택"
                      class="q-ml-sm"
                    />
                    <q-btn
                      @click="restaurantAddStep = 3"
                      color="primary"
                      label="다음"
                    />
                  </q-stepper-navigation>
                </q-step>

                <q-step
                  :name="3"
                  title="식당 이미지 업로드"
                  icon="add_photo_alternate"
                >
                  <image-upload
                    @fileUploaded="fn_fileUploaded"
                    @fileRemoved="fn_fileRemoved"
                  />

                  <q-stepper-navigation>
                    <q-btn
                      flat
                      @click="restaurantAddStep = 2"
                      color="primary"
                      label="이전 단계"
                      class="q-ml-sm"
                    />
                    <q-btn
                      color="primary"
                      label="저장"
                      @click="fn_saveRestaurant"
                    />
                  </q-stepper-navigation>
                </q-step>
              </q-stepper>
            </q-page>
          </q-page-container>
        </q-layout>
      </q-dialog>
    </div>

    <div class="popup">
      <q-dialog
        id="restaurantDetailPopup"
        ref="restaurantDetailPopup"
        v-model="isShowRestaurantDetailPopup"
        :maximized="isMobile"
        :full-width="isMobile"
        class="deatil"
      >
        <q-layout
          container
          :style="!isMobile ? { width: '1000px', 'max-width': '80vw' } : {}"
        >
          <q-header>
            <q-toolbar class="bg-primary">
              <q-toolbar-title>{{
                restaurantDetail.restaurantName
              }}</q-toolbar-title>
              <q-btn v-close-popup flat round dense icon="close" />
            </q-toolbar>
          </q-header>

          <q-page-container class="bg-white">
            <q-page padding>
              <q-splitter v-model="restaurantDetailSplitter" disable>
                <template v-slot:before>
                  <q-tabs
                    v-model="restaurantDetailTab"
                    vertical
                    class="text-light-blue-8"
                    v-if="!isMobile"
                  >
                    <q-tab name="basic" icon="info" label="정보" />
                    <q-tab name="menu" icon="restaurant_menu" label="메뉴" />
                  </q-tabs>
                </template>

                <template v-slot:after>
                  <q-tabs
                    v-model="restaurantDetailTab"
                    class="text-light-blue-8"
                    v-if="isMobile"
                  >
                    <q-tab name="basic" icon="info" label="정보" />
                    <q-tab name="menu" icon="menu" label="메뉴" />
                  </q-tabs>
                  <q-tab-panels
                    v-model="restaurantDetailTab"
                    animated
                    swipeable
                    vertical
                    transition-prev="jump-up"
                    transition-next="jump-up"
                  >
                    <q-tab-panel name="basic">
                      <div class="text-h4 q-mb-md">기본정보</div>
                      <div class="detail-info q-mb-md">
                        <q-field label="식당명" stack-label readonly>
                          <template v-slot:control>
                            <div class="self-center full-width no-outline">
                              {{ restaurantDetail.restaurantName }}
                            </div>
                          </template>
                        </q-field>

                        <q-field label="식당유형" stack-label readonly>
                          <template v-slot:control>
                            <div class="self-center full-width no-outline">
                              {{ restaurantDetail.restaurantKindCodeName }}
                            </div>
                          </template>
                        </q-field>

                        <q-field label="식당거리" stack-label readonly>
                          <template v-slot:control>
                            <div class="self-center full-width no-outline">
                              {{ restaurantDetail.restaurantDistance }} m
                            </div>
                          </template>
                        </q-field>
                      </div>

                      <div class="detail-map q-mb-md">
                        <map-location
                          :location="currentLocationCoordinate"
                          :place="{
                            placeName: restaurantDetail.restaurantName,
                            kakaoMapId: restaurantDetail.kakaoMapId,
                            la: restaurantDetail.la,
                            lo: restaurantDetail.lo
                          }"
                        />
                      </div>

                      <div class="detail-img">
                        <div class="q-my-xs row full-width justify-end">
                          <q-btn
                            @click="fn_changeRestaurantDetailImage"
                            color="primary"
                            label="사진 변경"
                          />
                        </div>

                        <q-img
                          :src="restaurantDetail.imageUrl"
                          class="fit image"
                          :rato="1"
                          :img-style="{
                            borderRadius: '2px',
                            border: '1px solid lightgray'
                          }"
                          no-native-menu
                        >
                        </q-img>

                        <image-upload
                          ref="restaurantDetailImageUpload"
                          :isVisible="false"
                          @fileAdded="fn_restaurantDetailImageAdded"
                          @fileUploaded="fn_restaurantDetailImageUploaded"
                        />
                      </div>
                    </q-tab-panel>

                    <q-tab-panel name="menu">
                      <div class="text-h4 q-mb-md">메뉴</div>
                      <q-intersection
                        v-for="(menu, menuIndex) in restaurantDetail.menuList"
                        :key="menuIndex"
                        class="q-ma-sm card-menu"
                      >
                        <q-card flat bordered>
                          <q-card-section class="q-pb-xs">
                            <div class="row">
                              <div class="col-5">
                                {{ menu.menuName }}
                              </div>
                              <div class="col-7 text-right">
                                <q-btn
                                  color="primary"
                                  size="sm"
                                  @click="fn_deleteMenu(menu)"
                                  class="q-mr-xs"
                                  >삭제</q-btn
                                >
                                <q-btn
                                  v-if="!menu.isModifyMenu"
                                  color="primary"
                                  size="sm"
                                  @click="
                                    () => {
                                      menu.modifyMenuName = menu.menuName
                                      menu.modifyMenuPrice = menu.menuPrice
                                      menu.isModifyMenu = true
                                    }
                                  "
                                  class="q-mr-xs"
                                  >수정</q-btn
                                >

                                <q-btn
                                  v-if="menu.isModifyMenu"
                                  color="primary"
                                  size="sm"
                                  @click="menu.isModifyMenu = false"
                                  class="q-mr-xs"
                                  >취소</q-btn
                                >

                                <q-btn
                                  v-if="menu.isModifyMenu"
                                  color="primary"
                                  size="sm"
                                  @click="fn_modifyMenu(menu)"
                                  >저장</q-btn
                                >
                              </div>
                            </div>
                          </q-card-section>

                          <q-card-section
                            v-if="menu.isModifyMenu"
                            class="q-py-sm"
                          >
                            <div class="row">
                              <div class="col-6">
                                <q-input
                                  :ref="
                                    (el: QInput) => {
                                      inp_modifyMenuMenuNames[
                                        menu.restaurantMenuSerialNo
                                      ] = el
                                    }
                                  "
                                  v-model="menu.modifyMenuName"
                                  label="메뉴명"
                                  counter
                                  clearable
                                  lazy-rules="ondemand"
                                  maxlength="200"
                                  :rules="[rulsAddMenuMenuName]"
                                >
                                </q-input>
                              </div>

                              <div class="col-1"></div>

                              <div class="col-5 text-right">
                                <q-input
                                  :ref="
                                    (el: QInput) => {
                                      inp_modifyMenuMenuPrices[
                                        menu.restaurantMenuSerialNo
                                      ] = el
                                    }
                                  "
                                  v-model="menu.modifyMenuPrice"
                                  label="금액"
                                  clearable
                                  unmasked-value
                                  reverse-fill-mask
                                  mask="###,###,###,###"
                                  lazy-rules="ondemand"
                                  type="tel"
                                  maxlength="15"
                                  min="0"
                                  :rules="[rulsAddMenuMenuPrice]"
                                >
                                </q-input>
                              </div>
                            </div>
                          </q-card-section>

                          <q-card-section v-else class="q-py-xs">
                            <div class="row">
                              <div class="col-6">
                                {{
                                  new Intl.NumberFormat('ko', {
                                    style: 'currency',
                                    currency: 'KRW'
                                  }).format(menu.menuPrice)
                                }}
                              </div>

                              <div class="col-6 text-right"></div>
                            </div>
                          </q-card-section>

                          <q-separator inset />

                          <q-card-section class="q-py-sm">
                            <div class="row full-height">
                              <q-intersection
                                v-for="(
                                  hashtag, hashtagIndex
                                ) in menu.menuHashtagList"
                                :key="hashtagIndex"
                                class="card-hashtag"
                              >
                                <q-chip
                                  removable
                                  @remove="fn_removeHashtag(hashtag)"
                                  color="primary"
                                  text-color="white"
                                  outline
                                  v-auto-animate
                                >
                                  {{ hashtag.hashtagName }}
                                </q-chip>
                              </q-intersection>

                              <div class="q-ma-xs row">
                                <div class="row">
                                  <q-input
                                    v-auto-animate
                                    v-if="menu.isHashtagAddMode"
                                    v-model="menu.addMenuHashtag.hashtagName"
                                    :ref=" (el: QInput) => { inp_addHashtages[
                                  menu.restaurantMenuSerialNo ] = el } "
                                    outlined
                                    round
                                    dense
                                    clearable
                                    autofocus
                                    class="input q-pb-none"
                                    maxlength="30"
                                    lazy-rules="ondemand"
                                    size="20px"
                                    input-style="width: 70px"
                                    :rules="[rulsAddHashtagName]"
                                  />
                                  <q-btn
                                    v-if="menu.isHashtagAddMode"
                                    outline
                                    push
                                    dense
                                    color="primary"
                                    class="q-ml-xs"
                                    @click="fn_addHashtag(menu.addMenuHashtag)"
                                    >저장</q-btn
                                  >
                                  <q-btn
                                    v-if="menu.isHashtagAddMode"
                                    outline
                                    push
                                    dense
                                    color="primary"
                                    class="q-ml-xs"
                                    @click="menu.isHashtagAddMode = false"
                                    >취소</q-btn
                                  >
                                </div>
                                <q-btn
                                  v-if="!menu.isHashtagAddMode"
                                  icon="add"
                                  outline
                                  color="primary"
                                  size="xs"
                                  class="q-mt-xs"
                                  @click="
                                    () => {
                                      menu.isHashtagAddMode = true
                                      menu.addMenuHashtag.hashtagName = ''
                                    }
                                  "
                                ></q-btn>
                              </div>
                            </div>
                          </q-card-section>
                        </q-card>
                      </q-intersection>

                      <q-card flat bordered class="q-ma-sm">
                        <q-toolbar>
                          <q-toolbar-title>메뉴 추가</q-toolbar-title>
                          <div class="q-ma-sm">
                            <q-btn color="primary" size="sm" @click="fn_addMenu"
                              >추가</q-btn
                            >
                          </div>
                        </q-toolbar>

                        <q-separator inset />

                        <q-card-section>
                          <div class="row">
                            <div class="col-6">
                              <q-input
                                ref="inp_addMenuMenuName"
                                v-model="addMenu.menuName"
                                label="메뉴명"
                                counter
                                clearable
                                lazy-rules="ondemand"
                                maxlength="200"
                                :rules="[rulsAddMenuMenuName]"
                              >
                              </q-input>
                            </div>

                            <div class="col-1"></div>

                            <div class="col-5 text-right">
                              <q-input
                                ref="inp_addMenuMenuPrice"
                                v-model="addMenu.menuPrice"
                                label="금액"
                                clearable
                                unmasked-value
                                reverse-fill-mask
                                mask="###,###,###,###"
                                lazy-rules="ondemand"
                                type="tel"
                                maxlength="15"
                                min="0"
                                :rules="[rulsAddMenuMenuPrice]"
                              >
                              </q-input>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </q-tab-panel>
                  </q-tab-panels>
                </template>
              </q-splitter>
            </q-page>
          </q-page-container>
        </q-layout>
      </q-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { QInput, useQuasar } from 'quasar'
import { type ApiResponse, type Code } from '@/interface/server'
import { codeUtil } from '@/utils/code'
import { imageUtil } from '~/utils/image'
import { josa } from 'hangul-util'

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
}

/* 메뉴 */
interface Menu {
  menu: {
    /* __placeholder__ */
    restaurantSerialNo: /* __placeholder__ */
    number
  }
  restaurantSerialNo: number
  restaurantMenuSerialNo: number
  menuName: string
  menuPrice: number
  menuHashtagList?: HashtagData[]
  isModifyMenu: boolean
  modifyMenuName: string
  modifyMenuPrice: number | null
  isHashtagAddMode: boolean
  addMenuHashtag: AddHashtagData
}

/* 메뉴 등록 */
interface AddMenu {
  restaurantSerialNo: number
  menuName: string
  menuPrice: number | null
}

/* 메뉴해시태그 */
interface HashtagData {
  restaurantSerialNo: number
  restaurantMenuSerialNo: number
  hashtagSerialNo: number
  hashtagName: string
}

/* 메뉴해시태그 등록 */
interface AddHashtagData {
  restaurantSerialNo: number
  restaurantMenuSerialNo: number
  hashtagName: string
}

const restaurantSrchReq = ref<
  Pick<Restaurant, 'restaurantName' | 'restaurantKindCode'>
>({
  restaurantName: '',
  restaurantKindCode: ''
})

const isRestaurantSelectMode = ref<boolean>(false)
const isRestaurantAddPopupPlaceSelected = ref<boolean>(false)
const isMobile = ref<boolean | undefined>(platform.is.mobile)

const restaurantAddPopup = ref()
const restaurantDetailPopup = ref()
const restaurantDetailTab = ref<'basic' | 'map' | 'menu'>('basic')
const restaurantDetailSplitter = ref<number>(isMobile.value ? 0 : 10)

const restaurantResList = ref<Restaurant[]>([])

const restaurantKindCodeOptions = ref<Code[]>([])
const restaurantKindCodeSearchOptions = ref<Code[]>([])
const currentLocationCode = ref<Code[]>([])

const currentLocationCoordinate = ref<{ x: number; y: number }>()

const restaurantDetail = ref<RestaurantDetail>({
  restaurantSerialNo: -1,
  restaurantName: '',
  restaurantKindCode: '',
  restaurantDistance: -1,
  la: '',
  lo: '',
  kakaoMapId: '',
  imageFileId: null,
  imageUrl: undefined,
  menuList: []
})

const restaurantDetailImageUpload = ref()

const isShowRestaurantAddPopup = ref<boolean>(false)
const isShowRestaurantDetailPopup = ref<boolean>(false)

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

const inp_addMenuMenuName = ref()
const inp_addMenuMenuPrice = ref()
const addMenu = ref<AddMenu>({
  restaurantSerialNo: -1,
  menuName: '',
  menuPrice: null
})

const inp_modifyMenuMenuNames = ref<{
  [key: number]: QInput
}>({})
const inp_modifyMenuMenuPrices = ref<{
  [key: number]: QInput
}>({})
const inp_addHashtages = ref<{
  [key: number]: QInput
}>({})

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
    .catch((error: ApiResponse<null>) => {
      console.error(error)
      alert(error.errorMessage)
    })

  loading.hide()
}

const fn_removeRestaurantList = async (): Promise<void> => {
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
      .catch((error: ApiResponse<null>) => {
        console.error(error)
        alert(error.errorMessage)
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

const fn_selectRestaurant = async (restaurantSerialNo: number) => {
  loading.show()

  await $fetch<ApiResponse<RestaurantDetail>>(
    '/playground/public/restaurant/getRstrntDetail',
    {
      method: 'POST',
      body: JSON.stringify({
        restaurantSerialNo
      })
    }
  )
    .then((result: ApiResponse<RestaurantDetail>) => {
      if (result.data != null) {
        restaurantDetail.value = result.data
        restaurantDetail.value.restaurantKindCodeName = restaurantDetail.value
          .restaurantKindCode
          ? restaurantKindCodeOptions.value.filter(
              (code) => code.code == restaurantDetail.value.restaurantKindCode
            )[0].codeName
          : ''

        restaurantDetail.value.imageUrl = restaurantDetail.value.imageFileId
          ? imageUtil.getImageUrl(restaurantDetail.value.imageFileId)
          : '/icon/no-image.png'

        restaurantDetail.value.menuList.forEach((menu: Menu) => {
          menu.isModifyMenu = false
          menu.isHashtagAddMode = false
          menu.addMenuHashtag = {
            restaurantSerialNo: menu.restaurantSerialNo,
            restaurantMenuSerialNo: menu.restaurantMenuSerialNo,
            hashtagName: ''
          }
        })

        restaurantDetailTab.value = 'basic'

        isShowRestaurantDetailPopup.value = true
      } else {
        alert('식당 정보가 없습니다. 다시 시도해 주세요.')
      }
    })
    .catch((error: ApiResponse<null>) => {
      console.error(error)
      alert(error.errorMessage)
    })

  loading.hide()
}

const fn_selectedAddRestaurant = async (
  selectedPlace: kakao.maps.services.PlacesSearchResultItem
) => {
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
          `'${selectedPlace.place_name}'${josa(
            selectedPlace.place_name,
            '은'
          )} ${existRestaurantName}이미 등록된 식당입니다.`
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
    .catch((error: ApiResponse<null>) => {
      console.error(error)
      alert(error.errorMessage)
    })

  loading.hide()
}

const fn_fileUploaded = (fileId: number) => {
  addRestaurant.value.imageFileId = fileId
}

const fn_fileRemoved = (_fileId: number) => {
  addRestaurant.value.imageFileId = null
}

const fn_saveRestaurant = async () => {
  if (!addRestaurant.value.kakaoMapId || !addRestaurant.value.restaurantName) {
    alert('식당정보를 선택해주세요.')
    restaurantAddStep.value = 1
    return
  } else if (!addRestaurant.value.imageFileId) {
    alert('식당이미지를 업로드 해 주세요.')
    return
  }

  loading.show()

  await $fetch<ApiResponse<Restaurant>>(
    '/playground/public/restaurant/addRstrnt',
    {
      method: 'POST',
      body: JSON.stringify(addRestaurant.value)
    }
  )
    .then(() => {
      alert('식당이 추가되었습니다.')
      isShowRestaurantAddPopup.value = false
      fn_getRestaurantList()
    })
    .catch((error: ApiResponse<null>) => {
      console.error(error)
      alert(error.errorMessage)
    })

  loading.hide()
}

const fn_changeRestaurantDetailImage = () => {
  restaurantDetailImageUpload.value.fn_triggerPickFile()
}

const fn_restaurantDetailImageAdded = () => {
  restaurantDetailImageUpload.value.fn_triggerUploadFile()
}
const fn_restaurantDetailImageUploaded = async (fileId: number) => {
  loading.show()

  await $fetch<ApiResponse<Restaurant>>(
    '/playground/public/restaurant/modifyRstrntImage',
    {
      method: 'POST',
      body: JSON.stringify({
        restaurantSerialNo: restaurantDetail.value.restaurantSerialNo,
        imageFileId: fileId
      })
    }
  )
    .then(() => {
      restaurantDetail.value.imageFileId = fileId
      restaurantDetail.value.imageUrl = imageUtil.getImageUrl(fileId)

      let restaurant = restaurantResList.value.find(
        (restaurant) =>
          restaurant.restaurantSerialNo ==
          restaurantDetail.value.restaurantSerialNo
      )

      if (restaurant) {
        restaurant.imageFileId = fileId
        restaurant.imageUrl = imageUtil.getImageUrl(fileId)
      }
    })
    .catch((error: ApiResponse<null>) => {
      console.error(error)
      alert(error.errorMessage)
    })

  loading.hide()
}

const fn_removeHashtag = async (hashtag: HashtagData) => {
  if (
    confirm(
      `'${hashtag.hashtagName}'${josa(
        hashtag.hashtagName,
        '를'
      )} 삭제하시겠습니까?`
    )
  ) {
    loading.show()

    await $fetch<ApiResponse<Restaurant[]>>(
      '/playground/public/restaurant/removeMenuHashtag',
      {
        method: 'POST',
        body: JSON.stringify({
          restaurantSerialNo: hashtag.restaurantSerialNo,
          restaurantMenuSerialNo: hashtag.restaurantMenuSerialNo,
          hashtagSerialNo: hashtag.hashtagSerialNo
        })
      }
    )
      .then((_result) => {
        fn_getMenuHashtagList(
          hashtag.restaurantSerialNo,
          hashtag.restaurantMenuSerialNo
        )
      })
      .catch((error: ApiResponse<null>) => {
        console.error(error)
        alert(error.errorMessage)
      })

    loading.hide()
  }
}

const fn_getMenuHashtagList = async (
  restaurantSerialNo: number,
  restaurantMenuSerialNo: number
) => {
  loading.show()

  await $fetch<ApiResponse<HashtagData[]>>(
    '/playground/public/restaurant/getMenuHashtagList',
    {
      method: 'POST',
      body: JSON.stringify({
        restaurantSerialNo,
        restaurantMenuSerialNo
      })
    }
  )
    .then((result) => {
      if (result.data) {
        const menu = restaurantDetail.value.menuList.find(
          (menu) => menu.restaurantMenuSerialNo == restaurantMenuSerialNo
        )

        if (menu) {
          result.data.forEach((hashtag) => {
            hashtag.restaurantSerialNo = restaurantSerialNo
            hashtag.restaurantMenuSerialNo = restaurantMenuSerialNo
          })

          menu.menuHashtagList = result.data
        }
      }
    })
    .catch((error: ApiResponse<null>) => {
      console.error(error)
      alert(error.errorMessage)
    })

  loading.hide()
}

const rulsAddHashtagName = (val: string) => {
  if (!val) {
    return '해시태그를 입력해주세요.'
  }

  return true
}

const fn_addHashtag = async (addHashtag: AddHashtagData) => {
  const refHashtagName =
    inp_addHashtages.value[addHashtag.restaurantMenuSerialNo]

  if (refHashtagName && refHashtagName.validate()) {
    loading.show()

    await $fetch<ApiResponse<HashtagData[]>>(
      '/playground/public/restaurant/addMenuHashtag',
      {
        method: 'POST',
        body: JSON.stringify({
          restaurantSerialNo: addHashtag.restaurantSerialNo,
          restaurantMenuSerialNo: addHashtag.restaurantMenuSerialNo,
          hashtagName: addHashtag.hashtagName
        })
      }
    )
      .then((result) => {
        if (result.data) {
          const menu = restaurantDetail.value.menuList.find(
            (menu) =>
              menu.restaurantMenuSerialNo == addHashtag.restaurantMenuSerialNo
          )

          if (menu) {
            result.data.forEach((hashtag) => {
              hashtag.restaurantSerialNo = addHashtag.restaurantSerialNo
              hashtag.restaurantMenuSerialNo = addHashtag.restaurantMenuSerialNo
            })

            menu.isHashtagAddMode = false
            menu.menuHashtagList = result.data
          }
        }
      })
      .catch((error: ApiResponse<null>) => {
        console.error(error)
        alert(error.errorMessage)
      })

    loading.hide()
  }
}

const rulsAddMenuMenuName = (val: string) => {
  if (!val) {
    return '메뉴명을 입력해주세요.'
  }

  return true
}

const rulsAddMenuMenuPrice = (val: number) => {
  if (!val) {
    return '메뉴 금액을 입력해주세요.'
  } else if (val <= 0) {
    return '메뉴 금액을 올바르게 입력해주세요.'
  }

  return true
}

const fn_addMenu = async () => {
  if (
    inp_addMenuMenuName.value.validate() &&
    inp_addMenuMenuPrice.value.validate()
  ) {
    loading.show()

    addMenu.value.restaurantSerialNo = restaurantDetail.value.restaurantSerialNo

    await $fetch<ApiResponse<Menu>>(
      '/playground/public/restaurant/addRstrntMenu',
      {
        method: 'POST',
        body: JSON.stringify(addMenu.value)
      }
    )
      .then((result: ApiResponse<Menu>) => {
        if (result.data) {
          fn_getMenuList(restaurantDetail.value.restaurantSerialNo)

          addMenu.value = {
            restaurantSerialNo: -1,
            menuName: '',
            menuPrice: null
          }
        }
      })
      .catch((error: ApiResponse<null>) => {
        console.error(error)
        alert(error.errorMessage)
      })

    loading.hide()
  }
}

const fn_modifyMenu = async (menu: Menu) => {
  const refMenuName = inp_modifyMenuMenuNames.value[menu.restaurantMenuSerialNo]
  const refMenuPrice =
    inp_modifyMenuMenuPrices.value[menu.restaurantMenuSerialNo]

  if (
    refMenuName &&
    refMenuName.validate() &&
    refMenuPrice &&
    refMenuPrice.validate()
  ) {
    if (
      menu.menuName == menu.modifyMenuName &&
      menu.menuPrice == menu.modifyMenuPrice
    ) {
      alert('변경사항이 없습니다.')

      return
    }

    loading.show()

    await $fetch<ApiResponse<void>>(
      '/playground/public/restaurant/modifyRstrntMenu',
      {
        method: 'POST',
        body: JSON.stringify({
          restaurantSerialNo: menu.restaurantSerialNo,
          restaurantMenuSerialNo: menu.restaurantMenuSerialNo,
          menuName: menu.modifyMenuName,
          menuPrice: menu.modifyMenuPrice
        })
      }
    )
      .then(() => {
        fn_getMenuList(menu.restaurantSerialNo)
      })
      .catch((error: ApiResponse<null>) => {
        console.error(error)
        alert(error.errorMessage)
      })

    loading.hide()
  }
}

const fn_deleteMenu = async (menu: Menu) => {
  if (confirm(`${menu.menuName} 메뉴를 삭제하시겠습니까?`)) {
    loading.show()

    await $fetch<ApiResponse<void>>(
      '/playground/public/restaurant/removeRstrntMenu',
      {
        method: 'POST',
        body: JSON.stringify({
          restaurantSerialNo: menu.restaurantSerialNo,
          restaurantMenuSerialNo: menu.restaurantMenuSerialNo
        })
      }
    )
      .then(() => {
        fn_getMenuList(menu.restaurantSerialNo)
      })
      .catch((error: ApiResponse<null>) => {
        console.error(error)
        alert(error.errorMessage)
      })

    loading.hide()
  }
}

const fn_getMenuList = async (restaurantSerialNo: number) => {
  loading.show()

  await $fetch<ApiResponse<Menu[] | []>>(
    '/playground/public/restaurant/getRstrntMenuList',
    {
      method: 'POST',
      body: JSON.stringify({ restaurantSerialNo })
    }
  )
    .then((result: ApiResponse<Menu[] | []>) => {
      if (result.data) {
        restaurantDetail.value.menuList = result.data
      }
    })
    .catch((error: ApiResponse<null>) => {
      console.error(error)
      alert(error.errorMessage)
    })

  loading.hide()
}
</script>

<style lang="scss" scoped>
.page-wrap {
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

  &.mobile .content .content-body {
    .card-restaurant {
      height: 450px;
      max-width: 100%;
    }

    .card-img {
      height: 380px;
    }
  }

  .detail-map {
    border: 1px solid lightgray;
  }
}
</style>

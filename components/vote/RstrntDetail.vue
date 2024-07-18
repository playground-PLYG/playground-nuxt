<template>
  <div>
    <dk-dialog header-label="식당 상세" v-bind="$attrs" class="deatil">
      <template #body>
        <dk-tabs
          v-model="tab"
          dense
          class="text-grey-7 vote-tab"
          active-color="blue-9"
          indicator-color="blue"
          align="justify"
        >
          <dk-tab name="info" label="정보" />
          <dk-tab name="menu" label="메뉴" />
        </dk-tabs>

        <dk-tab-panels v-model="tab" animated class="text-blue vote-list">
          <dk-tab-panel name="info">
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
                :place="{
                  placeName: restaurantDetail.restaurantName,
                  kakaoMapId: restaurantDetail.kakaoMapId,
                  la: restaurantDetail.la,
                  lo: restaurantDetail.lo
                }"
              />
            </div>
            <!-- 여기 이미지 두개로 바꿔야함-->
            <div class="detail-img">
              <div class="q-my-xs row full-width justify-end" />

              <q-img
                :src="restaurantDetail.imageUrl"
                class="fit image"
                :rato="1"
                :img-style="{
                  borderRadius: '2px',
                  border: '1px solid lightgray'
                }"
                no-native-menu
              />
            </div>
          </dk-tab-panel>

          <dk-tab-panel name="menu">
            <q-intersection
              v-for="(menu, menuIndex) in menuList"
              :key="menuIndex"
              class="q-ma-sm card-menu"
            >
              <q-card flat bordered>
                <q-card-section class="q-pb-xs">
                  <div class="row">
                    <div class="col-5">
                      {{ menu.menuName }}
                    </div>
                  </div>
                </q-card-section>

                <q-card-section class="q-py-xs">
                  <div class="row">
                    <div class="col-6">
                      {{
                        new Intl.NumberFormat('ko', {
                          style: 'currency',
                          currency: 'KRW'
                        }).format(menu.menuPrice)
                      }}
                    </div>

                    <div class="col-6 text-right" />
                  </div>
                </q-card-section>

                <q-separator inset />

                <q-card-section class="q-py-sm">
                  <div class="row full-height">
                    <q-intersection
                      v-for="(hashtag, hashtagIndex) in menu.menuHashtagList"
                      :key="hashtagIndex"
                      class="card-hashtag"
                    >
                      <q-chip
                        v-auto-animate
                        removable
                        color="primary"
                        text-color="white"
                        outline
                      >
                        {{ hashtag.hashtagName }}
                      </q-chip>
                    </q-intersection>
                  </div>
                </q-card-section>
              </q-card>
            </q-intersection>
          </dk-tab-panel>
        </dk-tab-panels>
      </template>
    </dk-dialog>
  </div>
</template>

<!-- 함수정의 -->
<script setup lang="ts">
import { ref } from 'vue'

const tab = ref('info')

const menuList = ref<Menu[]>([
  {
    menu: { restaurantSerialNo: 1 },
    restaurantSerialNo: 1,
    restaurantMenuSerialNo: 1,
    menuName: '햄버거',
    menuPrice: 12500,
    isModifyMenu: true,
    isHashtagAddMode: true
  }
])

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
  isModifyMenu?: boolean
  modifyMenuName?: string
  modifyMenuPrice?: number | null
  isHashtagAddMode?: boolean
  addMenuHashtag?: AddHashtagData
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
</script>

<template>
  <div>
    <div class="content q-pa-md q-gutter-md">
      <div class="title">
        <div class="text-h4"><q-icon name="rss_feed" /> 식당 리스트</div>
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
      <q-dialog v-model="isShowRestaurantAddPopup">
        <q-card>
          <q-card-section>
            <div class="text-h6">식당 추가</div>
          </q-card-section>

          <q-separator />

          <q-card-section style="max-height: 50vh" class="scroll">
            <p v-for="n in 15" :key="n">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum
              repellendus sit voluptate voluptas eveniet porro. Rerum blanditiis
              perferendis totam, ea at omnis vel numquam exercitationem aut,
              natus minima, porro labore.
            </p>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn v-close-popup flat label="Decline" color="primary" />
            <q-btn v-close-popup flat label="Accept" color="primary" />
          </q-card-actions>
        </q-card>
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

const { loading } = useQuasar()

/* 식당 */
interface Restaurant {
  restaurantSerialNo: number
  restaurantName: string
  restaurantKindCode: string
  restaurantDistance: number
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

const _selectedRestaurant = ref<Restaurant>({
  restaurantSerialNo: -1,
  restaurantName: '',
  restaurantKindCode: '',
  imageFileId: null,
  imageUrl: undefined,
  restaurantDistance: -1
})

const isShowRestaurantAddPopup = ref<boolean>(false)

const _addRestaurant = ref<
  Omit<Restaurant, 'restaurantSerialNo' | 'imageFileId' | 'imageUrl'>
>({
  restaurantName: '',
  restaurantKindCode: '',
  restaurantDistance: -1
})

const isRestaurantSelectMode = ref<boolean>(false)

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
  // 상태 체크 및 초기화
  isShowRestaurantAddPopup.value = !isShowRestaurantAddPopup.value
}

const fn_selectRestaurant = (restaurantSerialNo: number) => {
  if (!isShowRestaurantAddPopup.value) {
    console.log(restaurantSerialNo)
  }
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

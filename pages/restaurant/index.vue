<template>
  <div class="content q-pa-md q-gutter-md">
    <div class="title">
      <div class="text-h4">
        <q-icon name="rss_feed" /> 식당 리스트
      </div>
    </div>

    <div class="search">
      <q-form @submit="fn_getRstrntList" @reset="fn_resetRestaurantSearchArea">
        <q-card flat class="search-card">  
          <q-card-section class="row q-pa-none">
            <div class="row full-width q-pa-lg">
              <div class="text-grey-8 col-md-4 col-lg-4 col-xs-12 col-sm-12 q-pr-md">
                <q-select outlined v-model="restaurantSrchReq.rstrntKndCode" :options="restaurantKindCodeOptions" label="식당종류" round dense flat
                class="select" emit-value map-options />
              </div>
              <div class="text-grey-8 col-md-4 col-lg-4 col-xs-12 col-sm-12 q-pr-md">
                <q-input outlined v-model="restaurantSrchReq.rstrntNm" label="식당명" round dense flat class="input" />
              </div>

              <div class="text-grey-8 col-md-4 col-lg-4 col-xs-12 col-sm-12 q-pr-md">
                <div class="row full-width justify-end">
                  <div class="q-pl-xs">
                    <q-btn push class="button" color="green-7" label="초기화" type="reset" />
                  </div>
                  <div class="q-pl-xs">
                    <q-btn push class="button" color="green-7" label="조회" type="submit" />
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
            <div class="toolbar-box">
              <div class="q-pl-md flex inline" v-show="isRestaurantSelectMode">
                <q-btn push class="button" color="red-7" label="삭제" type="submit" />
              </div>
              <div class="q-pl-md flex inline">
                <q-toggle
                v-model="isRestaurantSelectMode"
                checked-icon="check"
                color="green"
                unchecked-icon="clear"
                size="lg"
                label="선택모드"
                left-label
              />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
    
    <div class="content-body">
      <div :class="['row justify-center q-gutter-sm', isRestaurantSelectMode ? 'restaurant-select-mode': '']">
        <q-intersection
          v-for="(restaurant, restaurantIndex) in restaurantResList"
          :key="restaurantIndex"
          class="q-ma-sm card-restaurant cursor-pointer"
        >
          <q-card flat bordered>
            <q-card-section>
              <q-img src="/icon/no-image.png" class="fit" :rato="1"  sizes="(max-width: 250px) 250px, (max-height: 300) 300px">
                <q-checkbox v-model="restaurant.isSelected" size="245px" checked-icon="task_alt" unchecked-icon="highlight_off" v-show="isRestaurantSelectMode" />
              </q-img>
            </q-card-section>

            <q-separator inset />

            <q-card-section>
              <div class="text-subtitle1">{{restaurant.rstrntNm}}</div>
            </q-card-section>
          </q-card>
        </q-intersection>

        <q-card flat bordered class="q-ma-sm card-restaurant add-btn-card">
          <q-card-section>
            식당 추가 버튼
          </q-card-section>
          <q-card-section>
            식당 추가 정보 입력 영역
          </q-card-section>
        </q-card>
      </div>
    </div>

    
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { type ApiResponse } from '../../interface/server';
import { useQuasar, type QTableProps } from 'quasar';
import type { PiniaVuePlugin } from 'pinia';

const router = useRouter();
const { loading } = useQuasar();

/* 식당 조회 요청 */
interface RestaurantSrchReq {
  rstrntKndCode: string,
  rstrntNm: string
}

/* 식당 */
interface Restaurant {
  rstrntSn: number,
  rstrntNm: string,
  rstrntKndCode: string,
  rstrntDstnc: number,
  isSelected?: boolean
}

/* 식당 저장 */
interface RestaurantAdd {
  rstrntNm: string,
  rstrntKndCode: string,
  rstrntDstnc: number | undefined
}

/* 메뉴 조회 요청 */
interface MenuSrchReq {
  restaurantSerialNo: number | undefined
}

/* 메뉴 */
interface Menu {
  restaurantSerialNo: number,
  restaurantMenuSerialNo: number,
  menuName: string,
  menuPrice: string,
  menuHashtagList?: HashtagData[]
}

interface HashtagData {
  hashtagId: string,
  restaurantSerialNo: number,
  restaurantMenuSerialNo: number,
  hashtagSerialNo: number,
  hashtagName: string
}


let restaurantSrchReq = ref<RestaurantSrchReq>({
  rstrntNm: '',
  rstrntKndCode: ''
})

let restaurantResList = ref<Restaurant[]>([]);

let restaurantKindCodeOptions = [
  { label: '전체', value: '' },
  { label: '한식', value: '001' },
  { label: '중식', value: '002' },
  { label: '일식', value: '003' },
  { label: '양식', value: '004' }
]

let selectedRestaurant = ref<Restaurant>({
  rstrntSn: -1,
  rstrntNm: '',
  rstrntKndCode: '',
  rstrntDstnc: -1
});

let addRestaurant = ref<RestaurantAdd>({
  rstrntNm: '',
  rstrntKndCode: '',
  rstrntDstnc: -1
});



let menuParam = ref<MenuSrchReq>({
  restaurantSerialNo: undefined
})

let isRestaurantSelectMode = ref<boolean>(false)

watch(isRestaurantSelectMode, (newValue, oldValue) => {
  if (newValue && restaurantResList.value.length > 0) {
    restaurantResList.value.forEach(restaurnat => restaurnat.isSelected = false)
  }
})

onMounted(() => {
  fn_getRstrntList()
})

const fn_getRstrntList = async () => {
  loading.show()

  await $fetch<ApiResponse<Restaurant[]>>(
  "/playground/public/restaurant/getRstrntList",
  {
    method: 'POST',
    body: JSON.stringify(restaurantSrchReq.value)
  })
  .then((result) => {
    if (result.data.length <= 0) {
      // 결과 없음 표시
    } else {
      result.data.forEach(restaurnat => restaurnat.isSelected = false)

      restaurantResList.value = result.data
    }
  })
  .catch((error) => {
    console.error(error)
  })

  loading.hide()
}

const fn_resetRestaurantSearchArea = () => {
  restaurantSrchReq.value = {
    rstrntKndCode: '',
    rstrntNm: ''
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
    }
  }
}

</style>
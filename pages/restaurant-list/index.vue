<template>
  <div class="content">
    <div class="title">
      <div class="text-h4"><q-icon name="rss_feed" /> 식당 리스트</div>
    </div>
    <div class="search">
      <q-form @submit="getRstrntList" @reset="onResetSelect">
        <q-select
          v-model="searchParam.restaurantKindCode"
          outlined
          :options="searchOptions"
          label="식당종류"
          round
          dense
          flat
          class="select"
          emit-value
          map-options
        />
        <q-input
          v-model="searchParam.restaurantName"
          outlined
          label="식당명"
          round
          dense
          flat
          class="input"
        />
        <q-btn push class="button" color="green-7" label="조회" type="submit" />
        <q-btn
          push
          class="button"
          color="green-7"
          label="초기화"
          type="reset"
        />
      </q-form>
    </div>
    <div class="table">
      <q-table
        v-model:selected="selected"
        :rows="resData"
        :columns="columns"
        row-key="rstrntNm"
        selection="multiple"
        :rows-per-page-options="[0]"
        @row-click="clickRow"
      />
    </div>
    <div class="proc">
      <q-btn
        push
        class="button"
        color="primary"
        label="등록"
        @click="showInsertDialog = true"
      />
      <q-btn
        push
        class="button"
        color="negative"
        label="삭제"
        @click="removeRstrnt"
      />
      <q-btn push class="buttonR" color="warning" label="사용여부 변경" />
    </div>
    <div class="popup">
      <q-dialog v-model="showInsertDialog" @hide="onReset">
        <q-layout container>
          <q-header>
            <q-toolbar class="bg-primary">
              <q-toolbar-title>등록</q-toolbar-title>
              <q-btn v-close-popup flat round dense icon="close" />
            </q-toolbar>
          </q-header>
          <q-page-container class="bg-white">
            <MapSearch
              :location="currentLocation"
              @marker-click="selectRstrnt"
            />
            <q-card>
              <q-card-section>
                <q-form @submit="onSubmit">
                  <q-input
                    v-model="param.restaurantName"
                    label="식당명"
                    class="input"
                    outlined
                    :rules="[nm_rules]"
                  />
                  <q-select
                    v-model="param.restaurantKindCode"
                    outlined
                    :options="searchOptions"
                    emit-value
                    map-options
                    label="식당종류"
                    class="select"
                    :rules="[select_rules]"
                  />
                  <q-input
                    v-model="param.restaurantDistance"
                    type="number"
                    label="식당거리(m)"
                    class="input"
                    outlined
                    :rules="[num_rules]"
                  />
                  <q-toolbar class="bg-white">
                    <q-toolbar-title />
                    <q-btn push color="primary" label="등록" type="submit" />
                  </q-toolbar>
                </q-form>
              </q-card-section>
            </q-card>
          </q-page-container>
        </q-layout>
      </q-dialog>
    </div>

    <div class="q-pa-md q-gutter-sm">
      <q-dialog v-model="showUpdateDialog" @hide="onReset">
        <q-card style="width: 800px; max-width: 100vw">
          <q-toolbar class="bg-primary">
            <q-toolbar-title style="color: white">식당</q-toolbar-title>
            <q-btn
              v-close-popup
              flat
              round
              dense
              icon=" close"
              style="color: white"
            />
          </q-toolbar>
          <q-card-section>
            <div class="map-location">
              <MapLocation
                v-if="showMapLocation"
                :location="currentLocation"
                :rstrnt="param"
              />
              <MapSearch
                v-if="!showMapLocation"
                :location="currentLocation"
                @marker-click="selectRstrnt"
              />
            </div>
            <q-form @submit="onSubmit">
              <q-input
                v-model="param.restaurantName"
                label="식당명"
                class="input"
                :rules="[nm_rules]"
                outlined
                :readonly="readonly"
              />
              <q-select
                v-model="param.restaurantKindCode"
                outlined
                emit-value
                map-options
                :options="searchOptions"
                label="식당종류"
                class="select"
                :rules="[select_rules]"
                :readonly="readonly"
              />
              <q-input
                v-model="param.restaurantDistance"
                type="number"
                label="식당거리(m)"
                class="input"
                outlined
                :readonly="readonly"
                :rules="[num_rules]"
              />
              <q-toolbar class="search">
                <q-toolbar-title />
                <q-btn
                  v-if="!(modifyClick == '')"
                  push
                  color="primary"
                  class="button"
                  label="취소"
                  @click="modifyCancel"
                />
                <q-btn
                  v-if="modifyClick == ''"
                  push
                  color="primary"
                  class="button"
                  label="수정"
                  @click="modifyRstrnt"
                />
                <q-btn
                  v-if="!(modifyClick == '')"
                  push
                  color="primary"
                  class="button"
                  label="등록"
                  type="submit"
                />
              </q-toolbar>
            </q-form>
          </q-card-section>
          <q-card-section>
            <div class="q-pa-md">
              <div class="text-h5">
                <q-icon name="restaurant_menu" />{{ restaurantNm }} 메뉴
              </div>
              <!-- <q-card-actions>
                <div class="search">
                  <q-form @submit="getRstrntMenuDetail" @reset="onMenuReset">
                    <q-input outlined class="input" v-model="menuParam.menuName" label="메뉴명" round dense flat
                      style="width: fit-content;" />
                    <q-btn push class="button" color="green-7" label="조회" type="submit" />
                    <q-btn push class="button" color="green-7" label="초기화" type="reset" />
                  </q-form>
                </div>
              </q-card-actions> -->
              <q-scroll-area style="height: 400px; max-width: 800px">
                <div class="row justify-center q-gutter-sm">
                  <q-intersection
                    v-for="(item, index) in menuData"
                    :key="index"
                    class="example-item"
                  >
                    <q-card
                      v-ripple
                      flat
                      bordered
                      class="q-ma-sm"
                      clickable
                      @click="modifyMenu(item)"
                    >
                      <!-- <img :src=item.menuName @click="modifyMenu(item)">  -->
                      <img src="https://cdn.quasar.dev/img/parallax2.jpg" />
                      <q-card-section>
                        <div class="text-subtitle2">
                          메뉴명 : {{ item.menuName }}
                        </div>
                        <div class="text-subtitle2">
                          가격 : {{ Number(item.menuPrice).toLocaleString() }}원
                        </div>
                      </q-card-section>
                    </q-card>
                  </q-intersection>
                  <div
                    v-show="noMenu == true"
                    class="text-negative"
                    style="text-align: center"
                  >
                    등록되어 있는 메뉴가 없어요 메뉴를 등록해주세요.
                  </div>
                </div>
              </q-scroll-area>
            </div>
            <q-toolbar class="search">
              <q-toolbar-title />
              <q-btn
                push
                color="primary"
                class="button"
                label="메뉴등록"
                @click="addMenu"
              />
            </q-toolbar>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>

    <div class="popup">
      <q-dialog v-model="showMenuDialog">
        <q-layout container style="height: 400px">
          <q-header>
            <q-toolbar class="bg-primary">
              <q-toolbar-title>메뉴등록</q-toolbar-title>
              <q-btn
                v-close-popup
                flat
                round
                dense
                icon="close"
                @click="onMenuReset"
              />
            </q-toolbar>
          </q-header>
          <q-page-container class="bg-white">
            <q-card>
              <q-card-section>
                <q-form @submit="menuSubmit">
                  <q-input
                    v-model="menuParam.menuName"
                    label="메뉴명"
                    class="input"
                    outlined
                    :rules="[nm_rules]"
                  />
                  <q-input
                    v-model="menuParam.menuPrice"
                    mask="###,###,###"
                    unmasked-value
                    reverse-fill-mask
                    input-class="text-right"
                    label="메뉴가격"
                    class="input"
                    :rules="[num_rules]"
                    outlined
                  />
                  <q-toolbar class="bg-white">
                    <q-toolbar-title />
                    <div class="proc">
                      <q-btn
                        push
                        class="button"
                        color="primary"
                        label="등록"
                        type="submit"
                      />
                      <q-btn
                        v-show="showMenuBtn == true"
                        push
                        class="button"
                        color="negative"
                        label="삭제"
                        @click="removeMenu"
                      />
                    </div>
                  </q-toolbar>
                </q-form>
              </q-card-section>
            </q-card>
          </q-page-container>
        </q-layout>
      </q-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { type QTableProps, useQuasar } from 'quasar'
import { type ApiResponse } from '../../interface/server'
import MapSearch from '~/components/MapSearch.vue'
import MapLocation from '~/components/MapLocation.vue'

const router = useRouter()
const { loading } = useQuasar()

interface Data {
  restaurantSerialNo: number
  restaurantName: string
  restaurantKindCode: string
  restaurantDistance: string
  recentChoiseDate: string
  kakaoMapId: string
  la: string
  lo: string
}

interface MenuData {
  restaurantSerialNo?: number
  restaurantMenuSerialNo?: string
  menuName?: string
  menuPrice?: string
}

interface RstrntData {
  restaurantSerialNo?: number
  restaurantName: string
  restaurantKindCode: string
  restaurantDistance?: string
  recentChoiseDate?: string | undefined
  kakaoMapId: string
  la: string
  lo: string
}

const param = ref<RstrntData>({
  restaurantSerialNo: 0,
  restaurantName: '',
  restaurantKindCode: '',
  restaurantDistance: '',
  kakaoMapId: '',
  la: '',
  lo: ''
})

const searchParam = ref<RstrntData>({
  restaurantKindCode: '',
  restaurantName: '',
  kakaoMapId: '',
  la: '',
  lo: ''
})

const menuParam = ref<MenuData>({
  restaurantSerialNo: 0,
  restaurantMenuSerialNo: '',
  menuName: '',
  menuPrice: ''
})

const resData = ref<Data[]>([])
const selected = ref<Data[]>()
const menuData = ref<MenuData[]>([])

const showInsertDialog = ref<boolean>(false)
const showUpdateDialog = ref<boolean>(false)
const showMenuDialog = ref<boolean>(false)
const showMenuBtn = ref<boolean>(false)
const noMenu = ref<boolean>(false)
const readonly = ref(true)
const modifyClick = ref('')
let restaurantNm = ''
const showMapLocation = ref(true)

const currentLocation = ref({ x: '126.981727', y: '37.567858' })

const searchOptions = [
  { label: '전체', value: '' },
  { label: '한식', value: '001' },
  { label: '중식', value: '002' },
  { label: '일식', value: '003' },
  { label: '양식', value: '004' }
]

const modifyCancel = () => {
  modifyClick.value = ''
  showMapLocation.value = true
  readonly.value = true
}

const selectRstrnt = (
  rstrnt: typeof window.kakao.maps.services.Places.PlacesSearchResultItem
) => {
  const rstrntCdNm = searchOptions.find(
    (element) => element.label == rstrnt.category_name.substring(6, 8)
  )
  param.value = {
    restaurantSerialNo: param.value.restaurantSerialNo
      ? param.value.restaurantSerialNo
      : 0,
    restaurantName: rstrnt.place_name,
    restaurantKindCode: rstrntCdNm?.value == undefined ? '' : rstrntCdNm?.value,
    restaurantDistance: rstrnt.distance,
    kakaoMapId: rstrnt.id,
    la: rstrnt.y,
    lo: rstrnt.x
  }
}

const nm_rules = (val: string) => {
  if (!val) {
    return '값을 입력해주세요.'
  }
  return true
}

const num_rules = (val: number) => {
  if (!val) {
    return '값을 입력해주세요.'
  }
  return true
}

const select_rules = (val: string) => {
  if (!val) {
    return '값을 선택해주세요.'
  }
  return true
}

const columns = ref<QTableProps['columns']>([
  {
    name: 'restaurantSerialNo',
    label: '식당일련번호',
    field: 'restaurantSerialNo',
    align: 'center'
  },
  {
    name: 'restaurantKindCode',
    label: '식당종류',
    field: 'restaurantKindCode',
    align: 'left',
    format: (val) =>
      val == '001'
        ? '한식'
        : val == '002'
        ? '중식'
        : val == '003'
        ? '일식'
        : '양식'
  },
  {
    name: 'restaurantName',
    label: '식당명',
    field: 'restaurantName',
    align: 'left'
  }
])

const clickRow = (_evt: Event, row: Data, _index: number) => {
  param.value = { ...row }
  restaurantNm = param.value.restaurantName
  getRstrntMenuList()
}

const onResetSelect = () => {
  searchParam.value = {
    restaurantKindCode: '',
    restaurantName: '',
    kakaoMapId: '',
    la: '',
    lo: ''
  }
  menuParam.value = {
    restaurantSerialNo: 0,
    restaurantMenuSerialNo: '',
    menuName: '',
    menuPrice: ''
  }
  selected.value = undefined
}

const onReset = () => {
  param.value = {
    restaurantName: '',
    restaurantKindCode: '',
    restaurantDistance: '',
    recentChoiseDate: '',
    kakaoMapId: '',
    la: '',
    lo: ''
  }
  readonly.value = true
  modifyClick.value = ''
  showMapLocation.value = true
}

const onMenuReset = () => {
  menuParam.value = {
    restaurantMenuSerialNo: '',
    menuName: '',
    menuPrice: ''
  }
}

const getRstrntList = async () => {
  loading.show()
  await $fetch<ApiResponse<Data[]>>(
    '/playground/public/restaurant/getRstrntList',
    {
      method: 'POST',
      body: JSON.stringify(searchParam.value)
    }
  )
    .then((result) => {
      resData.value = result.data
    })
    .catch((error) => {
      console.error(error)
    })
  loading.hide()
}

const onSubmit = async () => {
  loading.show()
  await $fetch<ApiResponse<Data[]>>('/playground/public/restaurant/addRstrnt', {
    method: 'POST',
    body: JSON.stringify(param.value)
  })
    .then(() => {
      alert('등록되었습니다.')
      router.go(0)
    })
    .catch((error) => {
      console.error(error)
      alert('등록되지 않았습니다.')
    })
  loading.hide()
}

const removeRstrnt = async () => {
  loading.show()
  await $fetch<ApiResponse<Data[]>>(
    '/playground/public/restaurant/removeRstrnt',
    {
      method: 'POST',
      body: JSON.stringify(selected.value)
    }
  )
    .then(() => {
      alert('삭제되었습니다.')
      router.go(0)
    })
    .catch((error) => {
      console.error(error)
      alert('삭제되지 않았습니다.')
    })
  loading.hide()
}

const getRstrntMenuList = async () => {
  menuParam.value.restaurantSerialNo = param.value.restaurantSerialNo
  menuParam.value.restaurantMenuSerialNo = ''
  menuParam.value.menuName = ''
  menuParam.value.menuPrice = ''

  loading.show()
  await $fetch<ApiResponse<MenuData[]>>(
    '/playground/public/restaurant/getRstrntMenuList',
    {
      method: 'POST',
      body: JSON.stringify(menuParam.value)
    }
  )
    .then((result) => {
      menuData.value = result.data

      if (result.data.length <= 0) {
        noMenu.value = true
      } else {
        noMenu.value = false
      }
    })
    .catch((error) => {
      console.error(error)
    })
  loading.hide()
  showUpdateDialog.value = true
}

const modifyRstrnt = () => {
  readonly.value = false
  showMapLocation.value = false
  modifyClick.value = '수정!'
}

const addMenu = () => {
  showMenuBtn.value = false
  showMenuDialog.value = true

  menuParam.value.restaurantMenuSerialNo = ''
  menuParam.value.menuName = ''
  menuParam.value.menuPrice = ''
}

const menuSubmit = async () => {
  loading.show()
  if (menuParam.value.restaurantMenuSerialNo !== '') {
    await $fetch<ApiResponse<MenuData[]>>(
      '/playground/public/restaurant/modifyRstrntMenu',
      {
        method: 'POST',
        body: JSON.stringify(menuParam.value)
      }
    )
      .then(() => {
        alert('수정되었습니다.')
        getRstrntMenuList()
        showMenuDialog.value = false
      })
      .catch((error) => {
        console.error(error)
        alert('수정되지 않았습니다.')
      })
  } else {
    await $fetch<ApiResponse<MenuData[]>>(
      '/playground/public/restaurant/addRstrntMenu',
      {
        method: 'POST',
        body: JSON.stringify(menuParam.value)
      }
    )
      .then(() => {
        alert('등록되었습니다.')
        getRstrntMenuList()
        showMenuDialog.value = false
      })
      .catch((error) => {
        console.error(error)
        alert('등록되지 않았습니다.')
      })
  }
  loading.hide()
}

const modifyMenu = (item?: {
  restaurantSerialNo?: number
  restaurantMenuSerialNo?: string
  menuName?: string
  menuPrice?: string
}) => {
  menuParam.value = { ...item }
  showMenuDialog.value = true
  showMenuBtn.value = true
}

const removeMenu = async () => {
  loading.show()
  await $fetch<ApiResponse<MenuData[]>>(
    '/playground/public/restaurant/removeRstrntMenu',
    {
      method: 'POST',
      body: JSON.stringify(menuParam.value)
    }
  )
    .then(() => {
      alert('삭제되었습니다.')
      getRstrntMenuList()
      showMenuDialog.value = false
    })
    .catch((error) => {
      console.error(error)
      alert('삭제되지 않았습니다.')
    })
  loading.hide()
}

// const getRstrntMenuDetail = async () => {
//   menuParam.value.restaurantSerialNo = param.value.rstrntSn

//   loading.show()
//   await $fetch<ApiResponse<MenuData[]>>(
//     '/playground/public/restaurant/getRstrntMenuList',
//     {
//       method: 'POST',
//       body: JSON.stringify(menuParam.value)
//     }
//   )
//     .then((result) => {
//       menuData.value = result.data
//     })
//     .catch((error) => {
//       console.error(error)
//     })
//   loading.hide()
// }

onMounted(() => {
  getRstrntList()
})
</script>

<style lang="scss" scoped>
.content {
  margin-top: 3rem;
  margin-left: 5rem;
  margin-right: 5rem;

  .title {
    margin-top: 3rem;
  }

  .search {
    margin-top: 2rem;

    .select {
      display: inline-block;
      vertical-align: middle;
      width: 15%;
      padding-right: 0.5rem;
    }

    .input {
      display: inline-block;
      vertical-align: middle;
      width: 15%;
      padding-right: 0.5rem;
    }

    .button {
      margin-right: 0.5rem;
    }
  }

  .proc {
    margin-top: 1rem;

    .button {
      margin-right: 0.5rem;
    }

    .buttonR {
      margin-left: 0.5rem;
      float: right;
    }
  }

  .example-item {
    height: 200px;
    width: 200px;
    margin-top: 1rem;
    margin-left: 0.5rem;
    margin-right: 0.5rem;
  }
}

.map-location {
  padding-bottom: 1.5rem;
}
</style>

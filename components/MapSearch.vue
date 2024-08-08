<template>
  <client-only>
    <div :class="['map_wrap', isMobile ? 'mobile' : '']">
      <div id="menu_wrap" class="bg_white">
        <div class="option">
          <div>
            <q-form class="q-pa-xs q-gutter-sm row" @submit="searchPlaces">
              <div class="col-8">
                <q-input
                  v-model="keyword"
                  dense
                  standout
                  flat
                  outlined
                  type="text"
                  maxlength="15"
                  label="검색어"
                />
              </div>
              <div class="col-3">
                <q-btn
                  outline
                  push
                  color="blue-6"
                  label="검색"
                  type="submit"
                  class="q-pa-xs full-width full-height"
                  size="sm"
                />
              </div>
            </q-form>
          </div>

          <div class="q-pa-xs q-gutter-sm">
            <div class="radius-wrap col-11 q-pa-xs q-px-md">
              <q-slider
                v-model="searchRadiusLazy"
                color="blue-6"
                snap
                dense
                label
                :markers="5"
                :marker-labels="searchRadiusLabel"
                :label-value="
                  searchRadiusLazy >= 1000
                    ? searchRadiusLazy / 1000 + 'km'
                    : searchRadiusLazy + 'm'
                "
                switch-marker-labels-side
                :min="100"
                :max="1200"
                :step="100"
                @change="
                  (val: number) => {
                    searchRadius = val
                  }
                "
              />
            </div>
          </div>
        </div>
        <hr />
        <div id="placesList" class="q-pa-none q-ma-none" />
        <div id="pagination" />
      </div>

      <div id="map" ref="mapArea" />

      <div v-if="isMobile" class="custom_control">
        <q-btn
          round
          push
          color="blue-5"
          icon="my_location"
          @click="fn_setCurrentLocation"
        />
      </div>
    </div>
  </client-only>
</template>

<script setup lang="ts">
import { useRuntimeConfig } from 'nuxt/app'
import type { SliderMarkerLabelDefinitionRequiredValue } from 'quasar'
import { useQuasar } from 'quasar'
import { onMounted, ref, watch } from 'vue'

const config = useRuntimeConfig()

const { platform, notify, loading } = useQuasar()
const isMobile = ref<boolean | undefined>(platform.is.mobile)

let markers: kakao.maps.Marker[]
let myMarker: kakao.maps.Marker
let infoWindow: kakao.maps.InfoWindow
let ps: kakao.maps.services.Places
let map: kakao.maps.Map
let markerPosition: kakao.maps.LatLng

const props = defineProps<{
  location: { x: number; y: number }
  keyword?: string
  searchRadius?:
    | 100
    | 200
    | 300
    | 500
    | 600
    | 700
    | 800
    | 900
    | 1000
    | 1100
    | 1200
}>()

const keyword = ref<string>(props.keyword ? props.keyword : '')
const searchRadius = ref<number>(props.searchRadius || 500)
const searchRadiusLazy = ref<number>(searchRadius.value)
const searchRadiusLabel: Array<SliderMarkerLabelDefinitionRequiredValue> = [
  { value: 100, label: '100m' },
  { value: 400, label: '400m' },
  { value: 700, label: '700m' },
  { value: 1000, label: '1km' },
  { value: 1200, label: '1.2km' }
]

const emit = defineEmits(['markerClick'])

watch(searchRadius, () => {
  searchPlaces()
})

onMounted(() => {
  loadScript()
})

const loadScript = () => {
  const script = document.createElement('script')
  script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${config.public.kakaoApiKey}&autoload=false&libraries=services`
  script.onload = loadMap
  document.head.appendChild(script)
}

const mapArea = ref()

const loadMap = () => {
  kakao.maps.load(() => {
    const container = mapArea.value //지도를 담을 영역의 DOM 레퍼런스

    const mapLevel: number = 2
    const mapCenter: kakao.maps.LatLng = fn_getMapCenter(
      mapLevel,
      props.location.x,
      props.location.y
    )

    const options: kakao.maps.MapOptions = {
      center: mapCenter, //지도의 중심좌표.
      level: mapLevel //지도의 레벨(확대, 축소 정도)
    }

    map = new kakao.maps.Map(container, options) //지도 생성 및 객체 리턴

    // 지도 타입 변경 컨트롤을 생성한다
    const mapTypeControl = new kakao.maps.MapTypeControl()

    // 지도의 상단 우측에 지도 타입 변경 컨트롤을 추가한다
    map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT)

    // 지도에 확대 축소 컨트롤을 생성한다
    const zoomControl = new kakao.maps.ZoomControl()

    // 지도의 우측에 확대 축소 컨트롤을 추가한다
    map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT)

    kakao.maps.event.addListener(map, 'click', function () {
      if (infoWindow) {
        infoWindow.close()
      }
    })

    ps = new kakao.maps.services.Places()

    ps.setMap(map)

    infoWindow = new kakao.maps.InfoWindow({ zIndex: 1 })

    markerPosition = new kakao.maps.LatLng(props.location.y, props.location.x)

    myMarker = new kakao.maps.Marker({
      position: markerPosition
    })

    myMarker.setMap(map) //현재 위치 마커 표시

    keyword.value = keyword.value.trim()

    if (keyword.value) {
      searchPlaces()
    }
  })
}

const searchPlaces = () => {
  keyword.value = keyword.value.trim()

  if (!keyword.value) {
    alert('키워드를 입력해주세요!')

    return
  }

  // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
  const keywordSearchOptions: kakao.maps.services.PlacesSearchOptions = {
    x: props.location.x,
    y: props.location.y,
    radius: searchRadius.value,
    category_group_code: 'FD6'
  }

  ps.keywordSearch(keyword.value, placesSearchCB, keywordSearchOptions)
}

const placesSearchCB = (
  data: kakao.maps.services.PlacesSearchResult,
  status: kakao.maps.services.Status,
  pagination: kakao.maps.Pagination
) => {
  if (status === kakao.maps.services.Status.OK) {
    // 정상적으로 검색이 완료됐으면
    // 검색 목록과 마커를 표출합니다
    displayPlaces(data)

    // 페이지 번호를 표출합니다
    displayPagination(pagination)
  } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
    alert('검색 결과가 존재하지 않습니다.')
    return
  } else if (status === kakao.maps.services.Status.ERROR) {
    alert('검색 중 오류가 발생했습니다.')
    return
  }
}

const displayPlaces = (places: kakao.maps.services.PlacesSearchResult) => {
  const listEl = document.getElementById('placesList'),
    menuEl = document.getElementById('menu_wrap'),
    fragment = document.createElement('ul'),
    bounds = new kakao.maps.LatLngBounds()

  // 검색 결과 목록에 추가된 항목들을 제거합니다
  if (listEl != null) {
    removeAllChildNods(listEl)
  }

  // 지도에 표시되고 있는 마커를 제거합니다
  removeMarker()

  for (let i = 0; i < places.length; i++) {
    // 마커를 생성하고 지도에 표시합니다
    const placePosition = new kakao.maps.LatLng(
        Number(places[i].y),
        Number(places[i].x)
      ),
      markers = addMarker(placePosition, i, places[i].place_name),
      itemEl = getListItem(i, places[i]) // 검색 결과 항목 Element를 생성합니다

    // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
    // LatLngBounds 객체에 좌표를 추가합니다
    bounds.extend(placePosition)

    //마커와 검색결과 항목에 click, mouseover 했을때
    //해당 장소에 인포윈도우에 장소명을 표시합니다
    //mouseout 했을 때는 인포윈도우를 닫습니다
    ;(function (
      marker: kakao.maps.Marker,
      places: kakao.maps.services.PlacesSearchResultItem
    ) {
      kakao.maps.event.addListener(marker, 'click', function () {
        displayInfowindow(marker, places)
        displayInfo(places)
      })

      itemEl.onmouseover = function () {
        displayInfowindow(marker, places)
      }

      itemEl.onmouseout = function () {
        //infoWindow.close()
      }
    })(markers, places[i])

    fragment.appendChild(itemEl)
  }

  // 검색결과 항목들을 검색결과 목록 Element에 추가합니다
  if (listEl != null) {
    listEl.appendChild(fragment)
  }

  if (menuEl?.scrollTop) {
    menuEl.scrollTop = 0
  }

  // 검색된 항목들을 검색결과 목록 Element에 추가합니다
  map.setBounds(bounds)
  map.setCenter(
    fn_getMapCenter(map.getLevel(), props.location.x, props.location.y)
  )
}

const removeAllChildNods = (el: Element) => {
  while (el.hasChildNodes()) {
    if (el.lastChild != null) {
      el.removeChild(el.lastChild)
    }
  }
}

const displayInfo = (_info: kakao.maps.services.PlacesSearchResultItem) => {}

// 지도 위에 표시되고 있는 마커를 모두 제거합니다
const removeMarker = () => {
  if (markers !== undefined) {
    for (const element of markers) {
      element.setMap(null)
    }
  }
  markers = []
}

// 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
function addMarker(
  position: kakao.maps.LatLng | kakao.maps.Viewpoint,
  idx: number,
  _title: string
) {
  const imageSrc =
    'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png' // 마커 이미지 url, 스프라이트 이미지를 씁니다
  const imageSize = new kakao.maps.Size(36, 37) // 마커 이미지의 크기
  const imgOptions = {
    spriteSize: new kakao.maps.Size(36, 691),
    // 스프라이트 이미지의 크기
    spriteOrigin: new kakao.maps.Point(0, idx * 46 + 10),
    // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
    offset: new kakao.maps.Point(13, 37) // 마커 좌표에 일치시킬 이미지 내에서의 좌표
  }
  const markerImage = new kakao.maps.MarkerImage(
    imageSrc,
    imageSize,
    imgOptions
  )
  const marker = new kakao.maps.Marker({
    position,
    // 마커의 위치
    image: markerImage
  })

  marker.setMap(map)
  // 지도 위에 마커를 표출합니다
  markers.push(marker)
  // 배열에 생성된 마커를 추가합니다

  return marker
}

// 검색결과 항목을 Element로 반환하는 함수입니다
function getListItem(
  index: number,
  places: kakao.maps.services.PlacesSearchResultItem
) {
  const el = document.createElement('li')
  let itemStr = `
    <div class="list-warp">
      <span class="markerbg marker_${index + 1}"></span>
      <div class="info">
        <div class="list-header">
          ${places.place_name}
        </div>
  `

  if (places.road_address_name) {
    itemStr += `
        <span>${places.road_address_name}</span>
        <span class="jibun gray">${places.address_name}</span>
      `
  } else {
    itemStr += `
        <span>${places.address_name}</span>
    `
  }

  itemStr += `
        <a class="tel" href="tel:${places.phone}">
          ${places.phone}
        </a>
      </div>
    </div>

    <div class="wrap-vertical-hr">
      <hr class="vertical-hr q-separator q-separator--vertical q-separator--vertical-inset q-mx-sm flex inline" aria-orientation="vertical">
    </div>
  `

  el.innerHTML = itemStr
  el.className = 'item'

  return el
}

// 검색결과 목록 또는 마커를 클릭했을 때 호출되는 함수입니다
// 인포윈도우에 장소명을 표시합니다
const displayInfowindow = (
  marker: kakao.maps.Marker,
  info: kakao.maps.services.PlacesSearchResultItem
) => {
  // HTMLElement로 설정하면 부모 요소를 가져올수있다
  //(커스텀 오버레이를 생성할때 부모element(style) 같이 생성되는데 이것때문에 customoverlay style이 잘 안나옴)
  const contents = document.createElement('div')
  contents.className = 'customoverlay'

  const childContent = `
      <a href="https://map.kakao.com/link/map/${info.id}" target="_blank" class="link-kakao">
        <span class="title">카카오맵 바로가기</span>
      </a>
      <a href="#" id="info" class="q-mt-xs select-place">
        <span class="title">${info.place_name}</span>
      </a>
  `

  contents.innerHTML = childContent

  // 커스텀 오버레이를 생성합니다
  const customOverlay = new kakao.maps.CustomOverlay({
    map,
    position: marker.getPosition(),
    content: contents,
    xAnchor: 1,
    yAnchor: 1
  })

  customOverlay.setMap(map)
  infoWindow.setContent(contents)
  infoWindow.open(map, marker)

  const windowPosition: kakao.maps.LatLng = infoWindow.getPosition()
  map.panTo(
    fn_getMapCenter(
      map.getLevel(),
      windowPosition.getLng(),
      windowPosition.getLat()
    )
  )

  const content: HTMLElement = customOverlay.getContent() as HTMLElement

  if (content && content.parentElement && content.parentElement.parentElement) {
    content.parentElement.parentElement.style.border = 'none'
    content.parentElement.parentElement.style.background = 'transparent'
  }

  const infoBtn = document.getElementById('info')

  if (infoBtn !== null) {
    infoBtn.onclick = function () {
      emit('markerClick', info)
    }
  }
}

// 검색결과 목록 하단에 페이지 번호를 표시하는 함수입니다
const displayPagination = (pagination: kakao.maps.Pagination) => {
  const paginationEl = document.getElementById('pagination')
  const fragment = document.createDocumentFragment()
  let i

  // 기존에 추가된 페이지번호를 삭제합니다
  if (paginationEl != null) {
    while (paginationEl.hasChildNodes()) {
      if (paginationEl.lastChild != null) {
        paginationEl.removeChild(paginationEl.lastChild)
      }
    }
  }

  for (i = 1; i <= pagination.last; i++) {
    const el = document.createElement('a')
    el.href = '#'
    el.innerHTML = i + ''

    if (i === pagination.current) {
      el.className = 'on'
    } else {
      el.onclick = (function (i) {
        return function () {
          pagination.gotoPage(i)
        }
      })(i)
    }

    fragment.appendChild(el)
  }
  if (paginationEl != null) {
    paginationEl.appendChild(fragment)
  }
}

/**
 * 검색영역으로 맵 정보가 최대한 가려지지 않도록 맵중앙 위치 보정
 */
const fn_getMapCenter = (
  mapLevel: number,
  x: number,
  y: number
): kakao.maps.LatLng => {
  if (platform.is.mobile) {
    return new kakao.maps.LatLng(y, x)
  }

  let correctionX = 0
  const correctionY = 0

  switch (mapLevel) {
    case 1:
      correctionX = -0.0003
      break
    case 2:
      correctionX = -0.0005
      break
    case 3:
      correctionX = -0.0015
      break
    case 4:
      correctionX = -0.003
      break
    case 5:
      correctionX = -0.006
      break
  }

  return new kakao.maps.LatLng(y + correctionY, x + correctionX)
}

const fn_setCurrentLocation = () => {
  if (navigator.geolocation) {
    loading.show()

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        loading.hide()

        map.setCenter(
          fn_getMapCenter(
            map.getLevel(),
            position.coords.longitude,
            position.coords.latitude
          )
        )
      },
      (positionError: GeolocationPositionError) => {
        loading.hide()

        let errMessage = ''

        switch (positionError.code) {
          case GeolocationPositionError.PERMISSION_DENIED:
            errMessage =
              '위치정보 조회 권한 없어서 기본 위치로 이동합니다.\n브라우저의 위치정보 권한을 허용하면 위치 확인이 가능합니다.'
            break
          case GeolocationPositionError.POSITION_UNAVAILABLE:
            errMessage = '위치정보를 사용 불가능해서 기본 위치로 이동합니다.'
            break
          case GeolocationPositionError.TIMEOUT:
            errMessage =
              '위치정보 조회 요청시간 초과되서 기본 위치로 이동합니다.'
            break
          default:
            errMessage =
              '위치 서비스를 사용 할 수 없어서 초기 위치로 이동합니다.'
        }

        map.setCenter(
          fn_getMapCenter(map.getLevel(), props.location.x, props.location.y)
        )

        notify({
          type: 'warning',
          html: true,
          message: errMessage,
          position: 'top'
        })
      }
    )
  } else {
    map.setCenter(
      fn_getMapCenter(map.getLevel(), props.location.x, props.location.y)
    )

    notify({
      type: 'warning',
      html: true,
      message: '위치 서비스를 사용 할 수 없습니다.<br/>초기 위치로 이동합니다.',
      position: 'top'
    })
  }
}
</script>

<style lang="scss" scoped>
.map_wrap:not(.mobile) {
  position: relative;
  width: 100%;
  height: 500px;

  *:not(i) {
    font-size: 12px;
  }

  a,
  a:hover,
  a:active {
    color: #000;
    text-decoration: none;
  }

  #map {
    width: 100%;
    min-height: 500px;

    :deep(div button[draggable='false']) {
      margin: 0;
      padding: 0;
    }
  }

  .custom_control {
    position: absolute;
    top: 5px;
    right: 125px;
    z-index: 3;
  }

  #menu_wrap {
    position: absolute;
    top: 0;
    left: 0;
    width: 250px;
    height: 100%;
    margin: 10px 0 30px 10px;
    padding: 5px;
    overflow-y: auto;
    background: rgba(255, 255, 255, 0.7);
    z-index: 2;
    font-size: 12px;
    border-radius: 10px;

    hr {
      display: block;
      height: 1px;
      border: 0;
      border-top: 2px solid #5f5f5f;
      margin: 3px 0;
    }

    .option {
      text-align: center;

      p {
        margin: 10px 0;
      }

      button {
        margin-left: 5px;
      }
    }

    #placesList {
      :deep(*) {
        padding: 0;
        margin: 0;
      }

      :deep(li) {
        list-style: none;

        &.item {
          position: relative;
          border-bottom: 1px solid #888;
          overflow: hidden;
          cursor: pointer;
          min-height: 65px;

          span {
            display: block;
            margin-top: 4px;
          }

          h5,
          .info {
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
          }

          .info {
            padding: 10px 0 10px 55px;

            .gray {
              color: #8a8a8a;
            }

            .jibun {
              padding-left: 26px;
              background: url(https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/places_jibun.png)
                no-repeat;
            }

            .tel {
              text-decoration: none;
              color: #009900;
            }
          }

          .markerbg {
            float: left;
            position: absolute;
            width: 36px;
            height: 37px;
            margin: 10px 0 0 10px;
            background: url(https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png)
              no-repeat;
          }

          .marker_1 {
            background-position: 0 -10px;
          }

          .marker_2 {
            background-position: 0 -56px;
          }

          .marker_3 {
            background-position: 0 -102px;
          }

          .marker_4 {
            background-position: 0 -148px;
          }

          .marker_5 {
            background-position: 0 -194px;
          }

          .marker_6 {
            background-position: 0 -240px;
          }

          .marker_7 {
            background-position: 0 -286px;
          }

          .marker_8 {
            background-position: 0 -332px;
          }

          .marker_9 {
            background-position: 0 -378px;
          }

          .marker_10 {
            background-position: 0 -423px;
          }

          .marker_11 {
            background-position: 0 -470px;
          }

          .marker_12 {
            background-position: 0 -516px;
          }

          .marker_13 {
            background-position: 0 -562px;
          }

          .marker_14 {
            background-position: 0 -608px;
          }

          .marker_15 {
            background-position: 0 -654px;
          }
        }

        .list-header {
          font-weight: bold;
        }
      }
    }

    #pagination {
      margin: 10px auto;
      text-align: center;

      :deep(a) {
        display: inline-block;
        margin-right: 10px;
      }

      :deep(.on) {
        font-weight: bold;
        cursor: default;
        color: #777;
      }
    }
  }

  .bg_white {
    background: #fff;
  }

  :deep(.customoverlay) {
    bottom: 85px;
    border-radius: 6px;
    border: 1px;
    border-bottom: 2px solid #ddd;
    float: left;
    z-index: 2;

    a {
      display: block;
      text-decoration: none;
      color: #000;
      text-align: center;
      border-radius: 6px;
      font-size: 14px;
      font-weight: bold;
      overflow: hidden;
      background: #d95050
        url(https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/arrow_white.png)
        no-repeat right 14px center;
    }

    .title {
      display: block;
      text-align: center;
      background: #fff;
      margin-right: 35px;
      padding: 10px 15px;
      font-size: 14px;
      font-weight: bold;
    }

    :nth-of-type(n) {
      border: 0;
      box-shadow: 0px 1px #c4c4c4;
    }

    :after {
      content: '';
      position: absolute;
      margin-left: -12px;
      left: 50%;
      bottom: -12px;
      width: 22px;
      height: 12px;
      background: url('https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/vertex_white.png');
    }
  }
}

.map_wrap.mobile {
  position: relative;
  border: 1px solid lightgray;
  width: 100%;

  *:not(i) {
    font-size: 12px;
  }

  a,
  a:hover,
  a:active {
    color: #000;
    text-decoration: none;
  }

  #map {
    width: 100%;
    min-height: 300px;

    :deep(div button[draggable='false']) {
      margin: 0;
      padding: 0;
    }
  }

  .custom_control {
    position: absolute;
    top: 230px;
    left: 8px;
    z-index: 3;
  }

  #menu_wrap {
    width: 100%;
    padding: 10px 10px 5px 10px;
    background: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    border-bottom: 1px solid lightgray;

    hr {
      display: block;
      height: 1px;
      border: 0;
      border-top: 2px solid lightgray;
      margin: 3px 0;
    }

    .option {
      padding-top: 4px;

      .radius-wrap {
        margin-top: 0;
      }
    }

    form {
      padding: 1px;

      & > div {
        margin-top: 3px;
      }
    }

    #placesList {
      :deep(*) {
        padding: 0;
        margin: 0;
      }

      :deep(ul) {
        overflow-y: auto;
        display: flex;
        flex-direction: row;

        li.item {
          list-style: none;
          height: 100%;
          display: flex;

          .list-warp {
            width: 215px;
          }

          span {
            display: block;
            margin-top: 2px;
          }

          .info {
            padding: 3px 0 3px 40px;

            .gray {
              color: #8a8a8a;
            }

            .jibun {
              padding-left: 26px;
              background: url(https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/places_jibun.png)
                no-repeat;
            }

            .tel {
              text-decoration: none;
              color: #009900;
            }
          }

          .markerbg {
            float: left;
            width: 36px;
            height: 45px;
            margin: 15px 0 0 0;
            background: url(https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png)
              no-repeat;
          }

          .marker_1 {
            background-position: 0 -10px;
          }

          .marker_2 {
            background-position: 0 -56px;
          }

          .marker_3 {
            background-position: 0 -102px;
          }

          .marker_4 {
            background-position: 0 -148px;
          }

          .marker_5 {
            background-position: 0 -194px;
          }

          .marker_6 {
            background-position: 0 -240px;
          }

          .marker_7 {
            background-position: 0 -286px;
          }

          .marker_8 {
            background-position: 0 -332px;
          }

          .marker_9 {
            background-position: 0 -378px;
          }

          .marker_10 {
            background-position: 0 -423px;
          }

          .marker_11 {
            background-position: 0 -470px;
          }

          .marker_12 {
            background-position: 0 -516px;
          }

          .marker_13 {
            background-position: 0 -562px;
          }

          .marker_14 {
            background-position: 0 -608px;
          }

          .marker_15 {
            background-position: 0 -654px;
          }
        }

        .list-header {
          font-weight: bold;
        }

        .wrap-vertical-hr {
          padding: 8px 0;
        }

        .vertical-hr {
          margin-right: 10px;
          height: 100%;
        }
      }
    }

    #pagination {
      margin: 5px auto;
      text-align: center;

      :deep(a) {
        display: inline-block;
        margin-right: 30px;
      }

      :deep(.on) {
        font-weight: bold;
        cursor: default;
        color: #777;
      }
    }
  }

  .bg_white {
    background: #fff;
  }

  :deep(.customoverlay) {
    bottom: 85px;
    border-radius: 6px;
    border: 1px;
    border-bottom: 2px solid #ddd;
    float: left;
    z-index: 2;

    a {
      display: block;
      text-decoration: none;
      color: #000;
      text-align: center;
      border-radius: 6px;
      font-size: 14px;
      font-weight: bold;
      overflow: hidden;
      background: #d95050
        url(https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/arrow_white.png)
        no-repeat right 14px center;
    }

    .title {
      display: block;
      text-align: center;
      background: #fff;
      margin-right: 35px;
      padding: 10px 15px;
      font-size: 14px;
      font-weight: bold;
    }

    :nth-of-type(n) {
      border: 0;
      box-shadow: 0px 1px #c4c4c4;
    }

    :after {
      content: '';
      position: absolute;
      margin-left: -12px;
      left: 50%;
      bottom: -12px;
      width: 22px;
      height: 12px;
      background: url('https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/vertex_white.png');
    }
  }
}
</style>

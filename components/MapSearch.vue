<template>
  <div class="map_wrap">
    <div id="map" style="width: 100%; height: 500px" />
    <div id="menu_wrap" class="bg_white">
      <div class="option">
        <div>
          <q-form @submit="searchPlaces">
            키워드 :
            <input id="keyword" v-model="keyword" type="text" size="15" />
            <button type="submit">검색하기</button>
          </q-form>
        </div>
      </div>
      <hr />
      <ul id="placesList" />
      <div id="pagination" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
const config = useRuntimeConfig()
const keyword = ref<string>('종각 맛집')
let markers: (typeof window.kakao.maps.Marker)[]
let myMarker
let infowindow: typeof window.kakao.maps.InfoWindow
let ps: typeof window.kakao.maps.services.Places
let map: typeof window.kakao.maps.Map
let markerPosition

const props = defineProps<{
  location: { x: string; y: string }
}>()
const emit = defineEmits(['markerClick'])

onMounted(() => {
  if (window.kakao?.maps) {
    loadMap()
  } else {
    loadScript()
  }
})

const loadScript = () => {
  const script = document.createElement('script')
  script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${config.public.kakaoApiKey}&autoload=false&libraries=services`
  script.onload = () => window.kakao.maps.load(loadMap)
  document.head.appendChild(script)
}

const loadMap = () => {
  window.kakao.maps.load(() => {
    const container = document.getElementById('map') //지도를 담을 영역의 DOM 레퍼런스
    const options = {
      center: new window.kakao.maps.LatLng(props.location.y, props.location.x), //지도의 중심좌표.
      level: 1 //지도의 레벨(확대, 축소 정도)
    }
    map = new window.kakao.maps.Map(container, options) //지도 생성 및 객체 리턴

    ps = new window.kakao.maps.services.Places()

    infowindow = new window.kakao.maps.InfoWindow({ zIndex: 1 })

    markerPosition = new window.kakao.maps.LatLng(
      props.location.y,
      props.location.x
    )
    myMarker = new window.kakao.maps.Marker({
      position: markerPosition
    })
    myMarker.setMap(map) //현재 위치 마커 표시
  })
}

const searchPlaces = () => {
  if (!keyword.value.replace(/^\s+|\s+$/g, '')) {
    alert('키워드를 입력해주세요!')
    return false
  }

  // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
  ps.keywordSearch(keyword.value, placesSearchCB, {
    x: '126.981727',
    y: '37.567858',
    category_group_code: 'FD6'
  })
}

const placesSearchCB = (
  data: (typeof window.kakao.maps.services.Places.PlacesSearchResultItem)[],
  status: string,
  pagination: number
) => {
  if (status === window.kakao.maps.services.Status.OK) {
    // 정상적으로 검색이 완료됐으면
    // 검색 목록과 마커를 표출합니다
    displayPlaces(data)

    // 페이지 번호를 표출합니다
    displayPagination(pagination)
  } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
    alert('검색 결과가 존재하지 않습니다.')
    return
  } else if (status === window.kakao.maps.services.Status.ERROR) {
    alert('검색 결과 중 오류가 발생했습니다.')
    return
  }
}

const displayPlaces = (
  places: (typeof window.kakao.maps.services.Places.PlacesSearchResultItem)[]
) => {
  const listEl = document.getElementById('placesList'),
    menuEl = document.getElementById('menu_wrap'),
    fragment = document.createElement('div'),
    bounds = new window.kakao.maps.LatLngBounds()

  // 검색 결과 목록에 추가된 항목들을 제거합니다
  if (listEl != null) {
    removeAllChildNods(listEl)
  }

  // 지도에 표시되고 있는 마커를 제거합니다
  removeMarker()

  for (let i = 0; i < places.length; i++) {
    // 마커를 생성하고 지도에 표시합니다
    const placePosition = new window.kakao.maps.LatLng(
        places[i].y,
        places[i].x
      ),
      markers = addMarker(placePosition, i, places[i].place_name),
      itemEl = getListItem(i, places[i]) // 검색 결과 항목 Element를 생성합니다

    // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
    // LatLngBounds 객체에 좌표를 추가합니다
    bounds.extend(placePosition)

    //마커와 검색결과 항목에 click, mouseover 했을때
    //해당 장소에 인포윈도우에 장소명을 표시합니다
    //mouseout 했을 때는 인포윈도우를 닫습니다
    ;(function (marker, places) {
      window.kakao.maps.event.addListener(marker, 'click', function () {
        displayInfowindow(marker, places)
        displayInfo(places)
      })

      itemEl.onmouseover = function () {
        displayInfowindow(marker, places)
      }

      itemEl.onmouseout = function () {
        infowindow.close()
      }
    })(markers, places[i])

    fragment.appendChild(itemEl)
  }
  // 검색결과 항목들을 검색결과 목록 Element에 추가합니다
  if (listEl != null) {
    listEl.appendChild(fragment)
  }
  menuEl?.scrollTop
  // 검색된 항목들을 검색결과 목록 Element에 추가합니다
  map.setBounds(bounds)
}

const removeAllChildNods = (el: Element) => {
  while (el.hasChildNodes()) {
    if (el.lastChild != null) {
      el.removeChild(el.lastChild)
    }
  }
}

const displayInfo = (
  _info: typeof window.kakao.maps.services.Places.PlacesSearchResultItem
) => {}

// 지도 위에 표시되고 있는 마커를 모두 제거합니다
const removeMarker = () => {
  if (markers !== undefined) {
    for (let i = 0; i < markers.length; i++) {
      markers[i].setMap(null)
    }
  }
  markers = []
}

// 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
function addMarker(position: object, idx: number, _title: string) {
  const imageSrc =
      'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png', // 마커 이미지 url, 스프라이트 이미지를 씁니다
    imageSize = new window.kakao.maps.Size(36, 37), // 마커 이미지의 크기
    imgOptions = {
      spriteSize: new window.kakao.maps.Size(36, 691),
      // 스프라이트 이미지의 크기
      spriteOrigin: new window.kakao.maps.Point(0, idx * 46 + 10),
      // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
      offset: new window.kakao.maps.Point(13, 37) // 마커 좌표에 일치시킬 이미지 내에서의 좌표
    },
    markerImage = new window.kakao.maps.MarkerImage(
      imageSrc,
      imageSize,
      imgOptions
    ),
    marker = new window.kakao.maps.Marker({
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
  places: typeof window.kakao.maps.services.Places.PlacesSearchResultItem
) {
  const el = document.createElement('li')
  let itemStr =
    '<span class="markerbg marker_' +
    (index + 1) +
    '"></span>' +
    '<div class="info">' +
    '   <h5>' +
    places.place_name +
    '</h5>'

  if (places.road_address_name) {
    itemStr +=
      '    <span>' +
      places.road_address_name +
      '</span>' +
      '   <span class="jibun gray">' +
      places.address_name +
      '</span>'
  } else {
    itemStr += '    <span>' + places.address_name + '</span>'
  }

  itemStr += '  <span class="tel">' + places.phone + '</span>' + '</div>'

  el.innerHTML = itemStr
  el.className = 'item'

  return el
}

// 검색결과 목록 또는 마커를 클릭했을 때 호출되는 함수입니다
// 인포윈도우에 장소명을 표시합니다
const displayInfowindow = (
  marker: typeof window.kakao.maps.Map,
  info: typeof window.kakao.maps.services.Places.PlacesSearchResultItem
) => {
  // HTMLElement로 설정하면 부모 요소를 가져올수있다
  //(커스텀 오버레이를 생성할때 부모element(style) 같이 생성되는데 이것때문에 customoverlay style이 잘 안나옴)
  const contents = document.createElement('div')
  contents.id = 'customoverlay'

  const childContent =
    '  <a href="https://map.kakao.com/link/map/' +
    info.id +
    '" target="_blank">' +
    '    <span class="title">카카오맵 바로가기</span>' +
    '  </a>' +
    '  <a href="#" id="info">' +
    '    <span class="title">' +
    info.place_name +
    '</span>' +
    '  </a>'

  contents.innerHTML = childContent

  // 커스텀 오버레이를 생성합니다
  const customOverlay = new window.kakao.maps.CustomOverlay({
    map,
    position: marker.position,
    content: contents,
    xAnchor: 1,
    yAnchor: 1
  })
  customOverlay.setMap(map)
  infowindow.setContent(contents)
  infowindow.open(map, marker)
  customOverlay.getContent().parentElement.parentElement.style.border = 'none'
  customOverlay.getContent().parentElement.parentElement.style.background =
    'transparent'

  const infoBtn = document.getElementById('info')
  if (infoBtn !== null) {
    infoBtn.onclick = function () {
      emit('markerClick', info)
    }
  }
}

// 검색결과 목록 하단에 페이지 번호를 표시하는 함수입니다
const displayPagination = (pagination: typeof window.kakao.maps.Pagination) => {
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
</script>
<style lang="scss" scoped>
.map_wrap,
.map_wrap * {
  margin: 0;
  padding: 0;
  font-family: 'Malgun Gothic', dotum, '돋움', sans-serif;
  font-size: 12px;
}
.map_wrap a,
.map_wrap a:hover,
.map_wrap a:active {
  color: #000;
  text-decoration: none;
}
.map_wrap {
  position: relative;
  width: 100%;
  height: 500px;
}
#menu_wrap {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 250px;
  margin: 10px 0 30px 10px;
  padding: 5px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.7);
  z-index: 1;
  font-size: 12px;
  border-radius: 10px;
}
.bg_white {
  background: #fff;
}
#menu_wrap hr {
  display: block;
  height: 1px;
  border: 0;
  border-top: 2px solid #5f5f5f;
  margin: 3px 0;
}
#menu_wrap .option {
  text-align: center;
}
#menu_wrap .option p {
  margin: 10px 0;
}
#menu_wrap .option button {
  margin-left: 5px;
}
#placesList :deep(li) {
  list-style: none;
}
#placesList :deep(.item) {
  position: relative;
  border-bottom: 1px solid #888;
  overflow: hidden;
  cursor: pointer;
  min-height: 65px;
}
#placesList :deep(.item span) {
  display: block;
  margin-top: 4px;
}
#placesList :deep(.item h5),
#placesList:deep(.item .info) {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
#placesList :deep(.item .info) {
  padding: 10px 0 10px 55px;
}
#placesList :deep(.info .gray) {
  color: #8a8a8a;
}
#placesList :deep(.info .jibun) {
  padding-left: 26px;
  background: url(https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/places_jibun.png)
    no-repeat;
}
#placesList :deep(.info .tel) {
  color: #009900;
}
#placesList :deep(.item .markerbg) {
  float: left;
  position: absolute;
  width: 36px;
  height: 37px;
  margin: 10px 0 0 10px;
  background: url(https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png)
    no-repeat;
}
#placesList :deep(.item .marker_1) {
  background-position: 0 -10px;
}
#placesList :deep(.item .marker_2) {
  background-position: 0 -56px;
}
#placesList :deep(.item .marker_3) {
  background-position: 0 -102px;
}
#placesList :deep(.item .marker_4) {
  background-position: 0 -148px;
}
#placesList :deep(.item .marker_5) {
  background-position: 0 -194px;
}
#placesList :deep(.item .marker_6) {
  background-position: 0 -240px;
}
#placesList :deep(.item .marker_7) {
  background-position: 0 -286px;
}
#placesList :deep(.item .marker_8) {
  background-position: 0 -332px;
}
#placesList :deep(.item .marker_9) {
  background-position: 0 -378px;
}
#placesList :deep(.item .marker_10) {
  background-position: 0 -423px;
}
#placesList :deep(.item .marker_11) {
  background-position: 0 -470px;
}
#placesList :deep(.item .marker_12) {
  background-position: 0 -516px;
}
#placesList :deep(.item .marker_13) {
  background-position: 0 -562px;
}
#placesList :deep(.item .marker_14) {
  background-position: 0 -608px;
}
#placesList :deep(.item .marker_15) {
  background-position: 0 -654px;
}
#pagination {
  margin: 10px auto;
  text-align: center;
}
#pagination :deep(a) {
  display: inline-block;
  margin-right: 10px;
}
#pagination :deep(.on) {
  font-weight: bold;
  cursor: default;
  color: #777;
}
:deep(#customoverlay) {
  bottom: 85px;
  border-radius: 6px;
  border: 0;
  border-bottom: 2px solid #ddd;
  float: left;
  z-index: 0;
}
:deep(#customoverlay:nth-of-type(n)) {
  border: 0;
  box-shadow: 0px 1px 2px #888;
}
:deep(#customoverlay a) {
  display: block;
  text-decoration: none;
  color: #000;
  text-align: center;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  overflow: hidden;
  background: #d95050;
  background: #d95050
    url(https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/arrow_white.png)
    no-repeat right 14px center;
}
:deep(#customoverlay .title) {
  display: block;
  text-align: center;
  background: #fff;
  margin-right: 35px;
  padding: 10px 15px;
  font-size: 14px;
  font-weight: bold;
}
:deep(#customoverlay:after) {
  content: '';
  position: absolute;
  margin-left: -12px;
  left: 50%;
  bottom: -12px;
  width: 22px;
  height: 12px;
  background: url('https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/vertex_white.png');
}
.customoverlayparent {
  cursor: default;
  position: absolute;
  background: transparent;
  border: 1px solid transparent;
  z-index: 1;
  display: block;
  left: -74px;
  top: 186px;
  width: 182px;
  height: 82px;
}
</style>

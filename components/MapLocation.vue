<template>
  <client-only>
    <div ref="mapContainer" :class="['map_wrap', isMobile ? 'mobile' : '']">
      <div id="mapWrapper">
        <div id="map" ref="mapArea" />
        <div
          id="roadviewControl"
          ref="roadviewControl"
          :class="rvActive ? 'active' : ''"
          @click="setRoadviewRoad"
        />
      </div>

      <div id="rvWrapper">
        <div v-if="rvActive" id="roadview" ref="roadview" />
      </div>
    </div>
  </client-only>
</template>
<script setup lang="ts">
import { useRuntimeConfig } from 'nuxt/app'
import { useQuasar } from 'quasar'
import { onMounted, ref, watch } from 'vue'

const config = useRuntimeConfig()

let marker: kakao.maps.Marker
let placeMarker: kakao.maps.Marker
let mapWalker: kakao.maps.Marker
let map: kakao.maps.Map
let markerPosition: kakao.maps.LatLng
let placeMarkerPosition: kakao.maps.LatLng
let bounds: kakao.maps.LatLngBounds
let infowindow: kakao.maps.InfoWindow
const rvActive = ref<boolean>(false)
let overlayOn: boolean = false // 지도 위에 로드뷰 오버레이가 추가된 상태를 가지고 있을 변수
let rvClient

const { platform } = useQuasar()
const isMobile = ref<boolean | undefined>(platform.is.mobile)

const mapArea = ref()
const roadviewControl = ref()
const roadview = ref()
const mapContainer = ref()

let rv: kakao.maps.Roadview

const props = defineProps<{
  location: { x: number; y: number }
  place: {
    placeName: string
    kakaoMapId: string
    la: string
    lo: string
  }
}>()

watch(
  props,
  () => {
    console.group('***')
    console.debug(props.location)
    console.debug(props.location.x)
    console.debug(props.location.y)
    console.debug(props.place)
    console.debug(props.place.placeName)
    console.debug(props.place.kakaoMapId)
    console.debug(props.place.la)
    console.debug(props.place.lo)
    console.groupEnd()
    diaplayPlace()
  },
  { deep: true }
)

onMounted(() => {
  loadScript()
})

const loadScript = () => {
  const script = document.createElement('script')
  script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${config.public.kakaoApiKey}&autoload=false&libraries=services,clusterer,drawing`
  script.onload = () => kakao.maps.load(loadMap)
  document.head.appendChild(script)
}

const loadMap = () => {
  kakao.maps.load(() => {
    const container = mapArea.value //지도를 담을 영역의 DOM 레퍼런스
    const options = {
      center: new kakao.maps.LatLng(props.location.y, props.location.x), //지도의 중심좌표.
      level: 1 //지도의 레벨(확대, 축소 정도)
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

    infowindow = new kakao.maps.InfoWindow({ zIndex: 1 })

    markerPosition = new kakao.maps.LatLng(props.location.y, props.location.x)

    placeMarkerPosition = new kakao.maps.LatLng(
      Number(props.place.la),
      Number(props.place.lo)
    )
    const imageSrc =
      'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png'
    // 마커 이미지의 이미지 크기 입니다
    const imageSize = new kakao.maps.Size(24, 35)

    // 마커 이미지를 생성합니다
    const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize)
    marker = new kakao.maps.Marker({
      position: markerPosition
    })
    placeMarker = new kakao.maps.Marker({
      position: placeMarkerPosition,
      image: markerImage
    })

    marker.setMap(map) //현재 위치 마커 표시
    placeMarker.setMap(map) //식당 위치 마커 표시

    bounds = new kakao.maps.LatLngBounds()

    bounds.extend(markerPosition)
    bounds.extend(placeMarkerPosition)

    map.setBounds(bounds, 100, 100, 100, 100)

    displayInfowindow(placeMarker)

    // 마커 이미지를 생성합니다
    const markImage = new kakao.maps.MarkerImage(
      'https://t1.daumcdn.net/localimg/localimages/07/2018/pc/roadview_minimap_wk_2018.png',
      new kakao.maps.Size(26, 46),
      {
        // 스프라이트 이미지를 사용합니다.
        // 스프라이트 이미지 전체의 크기를 지정하고
        spriteSize: new kakao.maps.Size(1666, 168),
        // 사용하고 싶은 영역의 좌상단 좌표를 입력합니다.
        // background-position으로 지정하는 값이며 부호는 반대입니다.
        spriteOrigin: new kakao.maps.Point(705, 114),
        offset: new kakao.maps.Point(13, 46)
      }
    )
    mapWalker = new kakao.maps.Marker({
      image: markImage,
      position: markerPosition,
      draggable: true
    })
  })
}

const displayInfowindow = (placeMarker: kakao.maps.Marker) => {
  const contents = document.createElement('div')
  contents.className = 'customoverlay'

  const childContent = `
      <a href="https://map.kakao.com/link/map/${props.place.kakaoMapId}" target="_blank" >
        <span class="title">카카오맵 바로가기</span>
      </a>
      <a href="https://place.map.kakao.com/${props.place.kakaoMapId}" target="_blank" id="info" class="q-mt-xs select-place">
        <span class="title">${props.place.placeName}</span>
      </a>
  `

  contents.innerHTML = childContent

  // 커스텀 오버레이를 생성합니다
  const customOverlay = new kakao.maps.CustomOverlay({
    map,
    position: placeMarker.getPosition(),
    content: contents,
    xAnchor: 1,
    yAnchor: 1
  })
  customOverlay.setMap(map)
  infowindow.setContent(contents)
  infowindow.open(map, placeMarker)

  const content: HTMLElement = customOverlay.getContent() as HTMLElement

  if (content && content.parentElement && content.parentElement.parentElement) {
    content.parentElement.parentElement.style.border = 'none'
    content.parentElement.parentElement.style.background = 'transparent'
  }
}

const diaplayPlace = () => {
  const imageSrc =
    'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png'
  // 마커 이미지의 이미지 크기 입니다
  const imageSize = new kakao.maps.Size(24, 35)

  // 마커 이미지를 생성합니다
  const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize)
  placeMarker = new kakao.maps.Marker({
    position: placeMarkerPosition,
    image: markerImage
  })

  placeMarker.setMap(map)

  bounds.extend(placeMarkerPosition)
  map.setBounds(bounds)

  displayInfowindow(placeMarker)
}

const setRoadviewRoad = () => {
  rvActive.value = !rvActive.value

  if (rvActive.value) {
    // 로드뷰 도로 오버레이가 보이게 합니다
    toggleOverlay(true)
  } else {
    // 로드뷰 도로 오버레이를 제거합니다
    toggleOverlay(false)
  }
}

const toggleOverlay = (active: boolean) => {
  if (active) {
    overlayOn = true

    // 지도 위에 로드뷰 도로 오버레이를 추가합니다
    map.addOverlayMapTypeId(kakao.maps.MapTypeId.ROADVIEW)

    // 지도 위에 마커를 표시합니다
    mapWalker.setMap(map)
    // marker.setMap(null)
    // 로드뷰의 위치를 현재 위치로 설정합니다
    toggleRoadview(placeMarkerPosition)
    // (현재 위치 좌표, 현재위치-음식점 중심 좌표 )
  } else {
    overlayOn = false

    // 지도 위의 로드뷰 도로 오버레이를 제거합니다
    map.removeOverlayMapTypeId(kakao.maps.MapTypeId.ROADVIEW)

    mapWalker.setMap(null)
    // marker.setMap(map)
  }
}

const toggleRoadview = (position: kakao.maps.LatLng) => {
  rvClient = new kakao.maps.RoadviewClient()
  rvClient.getNearestPanoId(position, 20, function (panoId) {
    // 파노라마 ID가 null 이면 로드뷰를 숨깁니다
    if (panoId === null) {
      map.setBounds(bounds, 100, 100, 100, 100)
    } else {
      map.setBounds(bounds, 100, 100, 100, 100)
      const rvContainer = roadview.value
      rv = new kakao.maps.Roadview(rvContainer, { pan: 180 })
      // panoId로 로드뷰를 설정합니다
      rv.setPanoId(panoId, position)

      // 마커에 dragend 이벤트를 등록합니다
      kakao.maps.event.addListener(mapWalker, 'dragend', function () {
        // 현재 마커가 놓인 자리의 좌표입니다
        const rvPosition = mapWalker.getPosition()

        // 마커가 놓인 위치를 기준으로 로드뷰를 설정합니다
        toggleRoadview(rvPosition)
      })

      // 로드뷰에 좌표가 바뀌었을 때 발생하는 이벤트를 등록합니다
      kakao.maps.event.addListener(rv, 'position_changed', function () {
        // 현재 로드뷰의 위치 좌표를 얻어옵니다
        const rvPosition = rv.getPosition()

        // 지도 위에 로드뷰 도로 오버레이가 추가된 상태이면
        if (overlayOn) {
          // 마커의 위치를 현재 로드뷰의 위치로 설정합니다
          mapWalker.setPosition(rvPosition)
        }
      })

      //지도에 클릭 이벤트를 등록합니다
      kakao.maps.event.addListener(
        map,
        'click',
        function (mouseEvent: kakao.maps.event.MouseEvent) {
          // 지도 위에 로드뷰 도로 오버레이가 추가된 상태가 아니면 클릭이벤트를 무시합니다
          if (!overlayOn) {
            return
          }

          // 클릭한 위치의 좌표입니다
          const clickPosition = mouseEvent.latLng

          // 마커를 클릭한 위치로 옮깁니다
          mapWalker.setPosition(clickPosition)

          // 클락한 위치를 기준으로 로드뷰를 설정합니다
          toggleRoadview(clickPosition)
        }
      )
    }
  })
}
</script>
<style lang="scss" scoped>
.map_wrap {
  overflow: hidden;
  position: relative;
  width: 100%;

  * {
    font-family: 'Malgun Gothic', dotum, '돋움', sans-serif;
    font-size: 12px;
  }

  #roadview {
    width: 100%;
    min-height: 250px;
  }

  #mapWrapper {
    z-index: 1;
    #roadviewControl {
      position: absolute;
      top: 5px;
      left: 5px;
      width: 42px;
      height: 42px;
      z-index: 1;
      cursor: pointer;
      background: url(https://t1.daumcdn.net/localimg/localimages/07/2018/pc/common/img_search.png)
        0 -450px no-repeat;
    }
    #roadviewControl.active {
      background-position: 0 -350px;
    }
    #map {
      width: 100%;
      min-height: 380px;

      :deep(div button[draggable='false']) {
        margin: 0;
        padding: 0;
      }
    }
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

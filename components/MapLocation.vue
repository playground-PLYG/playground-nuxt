<template>
  <div class="map_wrap">
    <div id="map" style="width: 100%; height: 500px" />
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
const config = useRuntimeConfig()
let marker
let rstrntMarker
let map: typeof window.kakao.maps.Map
let markerPosition
let rstrntMarkerPosition
let bounds: typeof window.kakao.maps.LatLngBounds
let infowindow: typeof window.kakao.maps.InfoWindow

const props = defineProps<{
  location: { x: string; y: string }
  rstrnt: {
    restaurantName: string
    kakaoMapId: string
    la: string
    lo: string
  }
}>()

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

    infowindow = new window.kakao.maps.InfoWindow({ zIndex: 1 })

    markerPosition = new window.kakao.maps.LatLng(
      props.location.y,
      props.location.x
    )

    rstrntMarkerPosition = new window.kakao.maps.LatLng(
      props.rstrnt.la,
      props.rstrnt.lo
    )
    const imageSrc =
      'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png'
    // 마커 이미지의 이미지 크기 입니다
    const imageSize = new window.kakao.maps.Size(24, 35)

    // 마커 이미지를 생성합니다
    const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize)
    marker = new window.kakao.maps.Marker({
      position: markerPosition
    })
    rstrntMarker = new window.kakao.maps.Marker({
      position: rstrntMarkerPosition,
      image: markerImage
    })

    marker.setMap(map) //현재 위치 마커 표시
    rstrntMarker.setMap(map) //식당 위치 마커 표시

    bounds = new window.kakao.maps.LatLngBounds()

    bounds.extend(markerPosition)
    bounds.extend(rstrntMarkerPosition)

    map.setBounds(bounds, 100, 100, 100, 100)

    displayInfowindow(rstrntMarker)
  })
}

const displayInfowindow = (rstrntMarker: typeof window.kakao.maps.Map) => {
  const contents = document.createElement('div')
  contents.id = 'customoverlay'

  const childContent =
    '  <a href="https://map.kakao.com/link/map/' +
    props.rstrnt.kakaoMapId +
    '" target="_blank">' +
    '    <span class="title">카카오맵 바로가기</span>' +
    '  </a>' +
    '  <a href="#" id="info">' +
    '    <span class="title">' +
    props.rstrnt.restaurantName +
    '</span>' +
    '  </a>'

  contents.innerHTML = childContent

  // 커스텀 오버레이를 생성합니다
  const customOverlay = new window.kakao.maps.CustomOverlay({
    map,
    position: rstrntMarker.position,
    content: contents,
    xAnchor: 1,
    yAnchor: 1
  })
  customOverlay.setMap(map)
  infowindow.setContent(contents)
  infowindow.open(map, rstrntMarker)
  customOverlay.getContent().parentElement.parentElement.style.border = 'none'
  customOverlay.getContent().parentElement.parentElement.style.background =
    'transparent'
}
</script>
<style lang="scss" scoped>
:deep(#customoverlay) {
  bottom: 85px;
  border-radius: 6px;
  border: 1px solid #ccc;
  border-bottom: 2px solid #ddd;
  float: left;
}
:deep(#customoverlay:nth-of-type(n)) {
  border: 0;
  box-shadow: 0px 1px #c4c4c4;
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

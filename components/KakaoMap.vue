<template>
  <div>
    <div id="map" style="width: 100%; height: 500px;"></div>
  </div>
</template>
<script setup lang="ts">

declare global {
  interface Window {
    kakao?: any
  }
}

onMounted(() => {
  if(window.kakao?.maps) {
      loadMap()
  }else {
      loadScript()
  }
})

const loadScript = () => {
  const script = document.createElement("script")
  const appKey = '7744821759a824188dafe7259f6c7a98'
  script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`
  script.onload = () => window.kakao.maps.load(loadMap)
  document.head.appendChild(script);
}

const loadMap = () => {
  window.kakao.maps.load(() => {
    const container = document.getElementById('map'); //지도를 담을 영역의 DOM 레퍼런스
    const options = { 
      center: new window.kakao.maps.LatLng(37.567858, 126.981727), //지도의 중심좌표.
      level: 1, //지도의 레벨(확대, 축소 정도)
    };
    const map = new window.kakao.maps.Map(container, options); //지도 생성 및 객체 리턴
    
    var markerPosition  = new window.kakao.maps.LatLng(37.567858, 126.981727); 
    var marker = new window.kakao.maps.Marker({
      position: markerPosition
    });
    marker.setMap(map);

    window.kakao.maps.event.addListener(map, 'click', function(mouseEvent:any) {        
      var latlng = mouseEvent.latLng; // 클릭한 위도, 경도 정보
      marker.setPosition(latlng); // 마커 위치를 클릭한 위치로
      
      var message = '클릭한 위치의 위도는 ' + latlng.getLat() + ' 이고, ';
      message += '경도는 ' + latlng.getLng() + ' 입니다';
      
      console.log(message);
    });
  });
}
</script>
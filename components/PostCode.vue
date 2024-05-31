<template>
  <div class="q-gutter-md row">
    <q-input
      v-model="param.zonecode"
      outlined
      type="text"
      label="우편번호"
      style="width: 250px"
      readonly
    />
    <q-btn
      color="primary"
      type="button"
      label="우편번호 찾기"
      style="width: 150px"
      @click="execDaumPostcode"
    />
  </div>
  <q-input
    v-model="param.roadAddress"
    outlined
    type="text"
    label="도로명주소"
    readonly
  />
  <q-input
    v-model="param.jibunAddress"
    outlined
    type="text"
    label="지번주소"
    readonly
  />
  <q-input
    ref="inputEl"
    v-model="param.detailAddress"
    outlined
    type="text"
    label="상세주소"
    @keyup="changeDetailAddress"
  />

  <div
    id="layer"
    style="
      display: none;
      position: fixed;
      overflow: hidden;
      z-index: 1;
      -webkit-overflow-scrolling: touch;
    "
  >
    <img
      id="btnFoldWrap"
      src="//t1.daumcdn.net/postcode/resource/images/close.png"
      style="
        cursor: pointer;
        position: absolute;
        right: 0px;
        top: -1px;
        z-index: 1;
      "
      alt="접기 버튼"
      @click="foldDaumPostcode()"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = defineProps({
  selectedType: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['emitArgs'])

/** 주소 정보 */
interface addressData {
  /** 우편번호 */
  zonecode: string
  /** 도로명 주소 */
  roadAddress: string
  /** 지번 주소 */
  jibunAddress: string
  /** 상세 주소 */
  detailAddress: string
  /** 선택여부 항목 */
  userSelectedType: string
}
declare global {
  interface Window {
    daum: any
  }
}

const param = ref<addressData>({
  zonecode: '',
  roadAddress: '',
  jibunAddress: '',
  detailAddress: '',
  userSelectedType: ''
})

interface InputEvent extends Event {
  target: HTMLInputElement
}

//한글 양방향 바인딩
const changeDetailAddress = (e: InputEvent) => {
  param.value.detailAddress = e.target.value
}

const isScriptLoaded = ref<boolean>(false)
const inputEl = ref<HTMLInputElement | null>(null)

const getElementLayer = () => {
  return document.getElementById('layer') as HTMLElement
}

const loadScript = () => {
  const script = document.createElement('script')
  script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
  script.onload = () => {
    isScriptLoaded.value = true
  }
  document.head.appendChild(script)
}

const execDaumPostcode = () => {
  const element_layer = getElementLayer()

  //도로명주소만 가져올때 !
  let autoClose = true
  if (props.selectedType === 'R') {
    autoClose = false
  }

  if (window.daum && window.daum.Postcode) {
    new window.daum.Postcode({
      oncomplete: (data: addressData) => {
        // 지번 주소를 선택했을 경우

        if (props.selectedType === 'R') {
          if (data.userSelectedType === 'J') {
            return alert('도로명주소를 선택하세요.')
          }
        }
        param.value = data

        foldDaumPostcode()
        //상세주소 입력 focus
        inputEl.value?.focus()
        emit('emitArgs', param.value)
      },
      width: '100%',
      height: '100%',
      maxSuggestItems: 5
    }).embed(element_layer, {
      autoClose
    })

    // iframe을 넣은 element를 보이게 한다.
    element_layer.style.display = 'block'

    // iframe을 넣은 element의 위치를 화면의 가운데로 이동시킨다.
    initLayerPosition()
  } else {
    console.error('Daum Postcode 스크립트가 로드되지 않았습니다.')
  }
}

const initLayerPosition = () => {
  const element_layer = getElementLayer()

  const width = 350
  const height = 500
  const borderWidth = 6

  element_layer.style.width = width + 'px'
  element_layer.style.height = height + 'px'
  element_layer.style.border = borderWidth + 'px solid'

  // // 실행되는 순간의 화면 너비와 높이 값을 가져와서 중앙에 뜰 수 있도록 위치를 계산한다.
  element_layer.style.left =
    ((window.innerWidth || document.documentElement.clientWidth) - width) / 2 -
    borderWidth +
    'px'
  element_layer.style.top =
    ((window.innerHeight || document.documentElement.clientHeight) - height) /
      2 -
    borderWidth +
    'px'
}

const foldDaumPostcode = () => {
  const element_layer = getElementLayer()
  // iframe을 넣은 element를 안보이게 한다.
  element_layer.style.display = 'none'
}

onMounted(() => {
  loadScript()
})
</script>

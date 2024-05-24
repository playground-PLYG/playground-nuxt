<template>
  <div class="q-gutter-md row">
    <q-input outlined type="text" v-model="param.zonecode" label="우편번호" style="width: 250px" readonly />
    <q-btn color="primary" type="button" @click="execDaumPostcode" label="우편번호 찾기" style="width: 150px" />
  </div>
  <q-input outlined type="text" v-model="param.roadAddress" label="도로명주소" readonly />
  <q-input outlined type="text" v-model="param.jibunAddress" label="지번주소" readonly />
  <q-input outlined type="text" v-model="param.detailAddress" label="상세주소" ref="inputEl" @keyup="changeVal" />
</template>



<script setup lang="ts">

import { ref } from 'vue'

const props = defineProps({
  selectedType: String
})

const emit = defineEmits(['emitArgs'])


/** 주소 정보 */
interface addressData {
  /** 우편번호 */
  zonecode: string,
  /** 도로명 주소 */
  roadAddress: string,
  /** 지번 주소 */
  jibunAddress: string,
  /** 상세 주소 */
  detailAddress: string,
  /** 선택여부 항목 */
  userSelectedType: string
}

declare global {
  interface Window {
    daum?: any
  }
}

let param = ref<addressData>({
  zonecode: '',
  roadAddress: '',
  jibunAddress: '',
  detailAddress: '',
  userSelectedType: ''
})

//한글 양방향 바인딩
const changeVal = (e: any) => {
  console.log("e.target.value", e.target.value)
  param.value.detailAddress = e.target.value;
};

let isScriptLoaded = ref<boolean>(false);
const inputEl = ref<HTMLInputElement | null>(null);

const loadScript = () => {
  const script = document.createElement("script");
  script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
  script.onload = () => {
    isScriptLoaded.value = true;
  };
  document.head.appendChild(script);
}

const execDaumPostcode = () => {
  console.log("selectedType :", props.selectedType);

  var width = 500;
  var height = 600;

  if (window.daum && window.daum.Postcode) {

    new window.daum.Postcode({
      width: width,
      height: height,

      oncomplete: (data: addressData) => {
        console.log("d a t a :", data);
        // 지번 주소를 선택했을 경우
        if (props.selectedType === 'R') {
          if (data.userSelectedType === 'J') {
            return alert("도로명주소를 선택하세요.")
          }
        }
        param.value = data

        console.log("p a r a m:", param.value);
        //상세주소 입력 focus
        inputEl.value?.focus();
        emit('emitArgs', param.value)
      }
    }).open({
      left: (window.screen.width / 2) - (width / 2),
      top: (window.screen.height / 2) - (height / 2),
    });

  } else {
    console.error("Daum Postcode 스크립트가 로드되지 않았습니다.");
  }
}


onMounted(() => {
  loadScript()

})

</script>

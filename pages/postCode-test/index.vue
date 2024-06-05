<template>
  <div>
    <div class="q-pa-md">
      <div class="text-h6">우편번호 검색</div>
      <q-toggle
        v-model="addressType.type"
        indeterminate-value="maybe"
        label="도로명 주소만 가져오기"
        true-value="R"
        false-value=""
      />
      <div class="q-gutter-y-md column" style="max-width: 450px">
        <post-code :selected-type="addressType.type" @emit-args="getPostCode" />

        <q-card flat bordered class="my-card">
          <q-card-section>
            <div class="text-h6">주소</div>
          </q-card-section>

          <q-separator inset />

          <q-card-section>
            <q-input v-model="getParam.zonecode" label=" 우편주소" readonly />
            <q-input v-model="getParam.address" label="기본주소" readonly />
            <q-input
              v-model="getParam.detailAddress"
              label="주소상세"
              readonly
            />
            <q-input
              v-model="getParam.userSelectedType"
              label="선택한 주소타입"
              hint="R(도로명), J(지번)"
              readonly
            />
            <q-input
              v-model="getParam.roadAddress"
              label="도로명주소"
              readonly
            />
            <q-input
              v-model="getParam.jibunAddress"
              label="지번주소"
              readonly
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PostCode from '@/components/PostCode.vue'

/** 전달받은 주소 데이터 */
interface Data {
  /** 우편번호 */
  zonecode: string
  /** 기본 주소 */
  address: string
  /** 상세 주소 */
  detailAddress: string
  /** 선택여부 항목 */
  userSelectedType: string
  /** 도로명 주소 */
  roadAddress: string
  /** 지번 주소 */
  jibunAddress: string
}

/** 주소 타입 */
interface TypeData {
  /** 주소 타입: R(도로명), J(지번) */
  type: string
}

const getParam = ref<Data>({
  zonecode: '',
  address: '',
  detailAddress: '',
  userSelectedType: '',
  roadAddress: '',
  jibunAddress: ''
})

const addressType = ref<TypeData>({
  type: ''
})

defineProps({
  selectedType: {
    type: String,
    required: true
  }
})

const getPostCode = function (...args: Data[]) {
  args.forEach((element) => {
    getParam.value = element
  })
}
</script>

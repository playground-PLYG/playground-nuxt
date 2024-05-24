<template>
    <div>
        <div class="q-pa-md">
            <div class="text-h6">우편번호 검색</div>
            <q-toggle indeterminate-value="maybe" v-model="addressType.type" label="도로명 주소만 가져오기" true-value="R"
                false-value="" />
            <div class="q-gutter-y-md column" style="max-width: 450px">
                <post-code :selected-type="addressType.type" @emit-args="getPostCode"></post-code>

                <q-card flat bordered class="my-card">
                    <q-card-section>
                        <div class="text-h6">주소</div>
                    </q-card-section>

                    <q-separator inset />

                    <q-card-section>
                        <q-input label=" 우편주소" v-model="getParam.zonecode" readonly />
                        <q-input label="기본주소" v-model="getParam.address" readonly />
                        <q-input label="주소상세" v-model="getParam.detailAddress" readonly />
                        <q-input label="선택한 주소타입" v-model="getParam.userSelectedType" hint="R(도로명), J(지번)" readonly />
                        <q-input label="도로명주소" v-model="getParam.roadAddress" readonly />
                        <q-input label="지번주소" v-model="getParam.jibunAddress" readonly />
                    </q-card-section>
                </q-card>
            </div>
        </div>
    </div>
</template>



<script setup lang="ts">
import PostCode from '@/components/PostCode.vue';

/** 전달받은 주소 데이터 */
interface Data {
    /** 우편번호 */
    zonecode: string,
    /** 기본 주소 */
    address: string,
    /** 상세 주소 */
    detailAddress: string,
    /** 선택여부 항목 */
    userSelectedType: string,
    /** 도로명 주소 */
    roadAddress: string,
    /** 지번 주소 */
    jibunAddress: string
}

/** 주소 타입 */
interface TypeData {
    /** 주소 타입: R(도로명), J(지번) */
    type: string
}

let getParam = ref<Data>({
    zonecode: '',
    address: '',
    detailAddress: '',
    userSelectedType: '',
    roadAddress: '',
    jibunAddress: ''
})

let addressType = ref<TypeData>({
    type: ''
})

defineProps({
    selectedType: String
})

const getPostCode = function (...args: Data[]) {

    args.forEach(element => {
        getParam.value = element
    });
    console.log('전달받은 데이터', getParam.value)
}


</script>

<template>
    <div v-if="show" class="q-pa-md">
        <div class="q-pa-md" style=" width: 335px; margin: 0 auto;">

            <q-form ref="loginForm" @submit="onSubmit" >
                
                <div class="text-h6" style="margin-bottom: 30px;">회원가입</div>
                <div class="q-gutter-y-md column" style="max-width: 300px;">
    
                <q-input outlined  v-model="param.mbrEmlAddr" label="이메일" :dense="dense" readonly :rules="[defaultRules]"/>
    
                <q-input outlined  v-model="param.mbrNm" label="이름" :dense="dense" :rules="[nameRules]" placeholder="예)홍길동"/>
    
                <q-input outlined  v-model="param.mbrBrdt" label="생년월일" :dense="dense" type="tel" maxlength="8" :rules="[brdtRules]" placeholder="예)19881225"/>
    
                <q-btn-toggle v-model="param.mbrGndrCd" spread no-caps toggle-color="primary" color="grey-2" text-color="black" unelevated size="sm" 
                    :options="[ {label: '남자', value: 'M'},{label: '여자', value: 'F'} ]" padding="11px" style="margin-bottom: 20px;"/>
    
                <q-input outlined  v-model="param.mbrTelno" label="전화번호" :dense="dense" type="tel" maxlength="11" :rules="[telNoRules]" placeholder="예)01012345678"/>
    
                <br>
                <br>
                <q-btn unelevated color="primary" text-color="white" label="회원가입" type="submit"  />
                <q-btn outline color="primary" label="취소" @click="cancel" />
    
                </div>
            </q-form>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useRouter } from "vue-router";
import { onMounted } from 'vue'
import axios from "axios";
import { useAuthStore } from '../../stores/useAuthStore' 
import { type ApiResponse } from '../../interface/server';
import { getParsedCommandLineOfConfigFile, validateLocaleAndSetLanguage } from 'typescript';
import { anyTypeAnnotation } from '@babel/types';
const { loading } = useQuasar()

const router = useRouter();
const store = useAuthStore();
const show = ref(false)
const dense = ref(true)
let token = ref('')
const loginForm = ref<any>(null)

interface Data {
  mbrNo: string
  mbrNm:string
  mbrBrdt: string
  mbrGndrCd: string
  mbrEmlAddr:string
  ciVl:string
  diVl:string
  mbrTelno: string
}

interface Param {
  mbrNm:string
  mbrBrdt: string
  mbrGndrCd: string
  mbrEmlAddr:string
  mbrTelno: string
}

let param = ref<Param>({
    mbrNm: '',
    mbrBrdt: '',
    mbrGndrCd: 'M',
    mbrEmlAddr: '',
    mbrTelno: ''
});

// let resData = ref<Data[]>();

onMounted(() => {
    loading.show()
    getToken();
})

function getToken (){
    const data ={
        grant_type: 'authorization_code',
        client_id: '68ae4b196239138e24e76a6664659155',
        redirect_uri: new URL(document.location.origin ) +'/sign-up',
        code: new URL(document.location.toString()).searchParams.get('code')
    }
    const config = {
        headers: {
            'Authorization': 'bearer ',
            'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
    }
    
    axios.post('https://kauth.kakao.com/oauth/token', data, config)
    .then((res) => {
        
        console.log('res ::: '+ res.data.access_token)
        config.headers.Authorization += res.data.access_token

        //token = res.data.access_token
        localStorage.setItem('access_token', res.data.access_token)
        console.log('localstorage.getItem(access_token) ::::: ' , localStorage.getItem('access_token'))
        store.token = res.data.access_token
        console.log('store.token ::: ', store.token)

        axios.post('https://kapi.kakao.com/v2/user/me', {}, config)
        .then((response) => {
            console.log('id : ' + response.data.id + ', email : ' + response.data.kakao_account.email + ', nickname : ' + response.data.properties.nickname)

            getEmail(response.data.kakao_account.email);
        })
        .catch((error) => {
            // console.log('user No response received:', error.request);
            // console.log('user Server responded with status code:', error.response.status);
            // console.log('user Response data:', error.response.data);
        })
    })
}

const getEmail = async (email:string) => {
    const result = await $fetch<ApiResponse<Data>>('/playground/public/pgMember/get-email?email=' + email, {
        method: 'GET'
    })
    const resData = result.data
    loading.hide()
    console.log('getEmail - resData.mbrNm ::::: ', resData.mbrNm)
    if(resData.mbrNo == '0' || resData.mbrNo == null){ //회원가입 필요
        window.alert("회원가입이 필요합니다.")
        param.value.mbrEmlAddr = email;
        show.value = true
    }else { //로그인 완료 
        window.alert("로그인 완료")
        store.name = resData.mbrNm
        console.log('getEmail - store.name ::: ', store.name)
        router.push({ path: "/" });
    }

}

const onSubmit = async () => {

    // const validateResult = loginForm.value?.validate()
    // console.log('validateResult ::: ', validateResult)
    loading.show()
    const result = await $fetch<ApiResponse<Data>>('/playground/public/pgMember/sign-up', {
        method: 'POST',
        body: JSON.stringify(param.value) 
    })
    const resData = result.data
    console.log('signUp - resData.mbrNm ::::: ', resData.mbrNm)
    store.name = resData.mbrNm
    console.log('onSubmit - store.name ::: ', store.name)
    loading.hide()
    window.alert("회원가입 완료")
    router.push({ path: "/" });
}

const cancel = () => {
    router.push({ path: "/" });
}

const nameRules = (val: string) => {
    if(!val){
        return '이름을 입력해주세요.'
    }
    if(checkSpecial(val)) {
        return '특수문자는 입력할 수 없습니다.'
    }
    if(val.length < 2) {
        return '이름은 2자 이상이어야 합니다.'
    }
    return true
}

const defaultRules = (val: string) => {
    if(!val){
        cancel
    }
    return true
} 

const telNoRules = (val: string) => {
    if(!val){
        return '전화번호를 입력해주세요.'
    }
    if(checkSpecial(val)) {
        return '특수문자는 입력할 수 없습니다.'
    }
    if(checkNumber(val)) {
        return '숫자만 입력할 수 있습니다.'
    }
    if(val.length < 11) {
        return '전화전호는 11자 이상이어야 합니다.'
    }
    return true
}

const brdtRules = (val: string) => {
    if(!val){
        return '생년월일을 입력해주세요.'
    }
    if(checkSpecial(val)) {
        return '특수문자는 입력할 수 없습니다.'
    }
    if(checkNumber(val)) {
        return '숫자만 입력할 수 있습니다.'
    }
    if(val.length < 8) {
        return '생년월일은 8자 이상이어야 합니다.'
    }
    return true
}

const check = (val: string) => {
    var regExp = /\s/g;
    return val.replaceAll(regExp, "")
}

const checkSpecial = (val: string) => {
    return val.match(/[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/g);
}

const checkNumber = (val: string) => { 
    return !val.match(/[0-9]/g);
}

</script>
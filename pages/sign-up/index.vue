<template>
    <div v-if="show" class="q-pa-md">
        <div class="q-pa-md" style=" width: 335px; margin: 0 auto;">

            <q-form ref="loginForm" @submit="onSubmit" >
                
                <div class="text-h6" style="margin-bottom: 30px;">회원가입</div>
                <div class="q-gutter-y-md column" style="max-width: 300px;">
    
                <q-input outlined  v-model="param.mberEmailAdres" label="이메일" :dense="dense" readonly :rules="[defaultRules]"/>
    
                <q-input outlined  v-model="param.mberNm" label="이름" :dense="dense" :rules="[nameRules]" placeholder="예)홍길동"/>
    
                <q-input outlined  v-model="param.mberBymd" label="생년월일" :dense="dense" type="tel" maxlength="8" :rules="[brdtRules]" placeholder="예)19881225"/>
    
                <q-btn-toggle v-model="param.mberSexdstnCode" spread no-caps toggle-color="primary" color="grey-2" text-color="black" unelevated size="sm" 
                    :options="[ {label: '남자', value: 'M'},{label: '여자', value: 'F'} ]" padding="11px" style="margin-bottom: 20px;"/>
    
                <q-input outlined  v-model="param.mberTelno" label="전화번호" :dense="dense" type="tel" maxlength="11" :rules="[telNoRules]" placeholder="예)01012345678"/>
    
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
import { useAuthStore } from '../../stores/useAuthStore' 
import { type ApiResponse } from '../../interface/server';
import type { FetchResponse } from "ofetch";
const { loading } = useQuasar()

const router = useRouter();
const store = useAuthStore();
const show = ref(false)
const dense = ref(true)
let token = ref<any>('')
let snsLogin = ref<string>("")
const loginForm = ref<any>(null)

interface Data {
  mberId: string
  mberNm: string
  mberBymd: string
  mberSexdstnCode: string
  mberEmailAdres:string
  ciCn:string
  diCn:string
  mberTelno: string
}

interface Param {
  mberNm:string
  mberBymd: string
  mberSexdstnCode: string
  mberEmailAdres:string
  mberTelno: string
}
interface Token {
FetchResponse(FetchResponse: any): unknown;
  access_token: string,
  refresh_token: string
}

let param = ref<Param>({
    mberNm: '',
    mberBymd: '',
    mberSexdstnCode: 'M',
    mberEmailAdres: '',
    mberTelno: ''
});

interface KakaoUser {
    kakao_account : {
        email:string
    },
    id: string,
    properties: {
        nickname:string
    }
}

interface NaverUser {
    response : {
        id:string,
        email:string,
        name:string
    }
}


onMounted(() => {
    loading.show()

    snsLogin = localStorage.getItem('snsLogin')
    if(snsLogin == 'KAKAO') {
        getTokenKAKAO()
    }else if(snsLogin == 'NAVER') {
        getTokenNAVER()
    }else if(snsLogin == 'GOOGLE') {
        getTokenGOOGLE()
    }
    //getToken();
})

const getTokenKAKAO = async () => {
    const client_id = '68ae4b196239138e24e76a6664659155'
    const config = {
        'Authorization': 'bearer ',
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
    }
    const code = new URL(document.location.toString()).searchParams.get('code')
    const redirect_uri = new URL(document.location.origin ) +'/sign-up'
    await $fetch<Token>('https://kauth.kakao.com/oauth/token', {
        method: 'POST',
        headers: config,
        body: `grant_type=authorization_code&client_id=${client_id}&redirect_uri=${redirect_uri}&code=${code}`
    })
    .then((data) => {
        console.log('data: ', data.access_token)
        config.Authorization += data.access_token
        token = data.access_token
        $fetch<KakaoUser>('https://kapi.kakao.com/v2/user/me', {
            method: 'POST',
            headers: config
        })
        .then((response) => {
            console.log('id : ' + response.id + ', email : ' + response.kakao_account.email + ', nickname : ' + response.properties.nickname)
            getEmail(response.kakao_account.email);
        })

    })
}

const getTokenNAVER = async () => {
    const client_id = 'CzAlAQJdMEto7NeN57QA'
    const client_secret = '4TqLSzR0O7'
    const state = 'RAMDOM_STATE'
    const config = {
        'Authorization': 'bearer ',
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
        // CORS....
        //'Access-Control-Allow-Origin' : '*',
        'x-cors-api-key': 'temp_f4d4037d6e5c605391e488d986cc0a59', // https://proxy.cors.sh/
        //'APIKey': 'COVID_APIKEY' // https://cors-anywhere.herokuapp.com/
    }
    const code = new URL(document.location.toString()).searchParams.get('code')
    const redirect_uri = encodeURI(new URL(document.location.origin ) +'/sign-up')
    await $fetch<Token>('https://proxy.cors.sh/' + 'https://nid.naver.com/oauth2.0/token', {
        method: 'POST',
        headers: config,
        //mode: 'no-cors',
        body: `grant_type=authorization_code&client_id=${client_id}&client_secret=${client_secret}&code=${code}&state=${state}`
    })
    .then((data) => {
        console.log('data: ', data.access_token)
        config.Authorization += data.access_token
        token = data.access_token
        $fetch<NaverUser>('https://proxy.cors.sh/' + 'https://openapi.naver.com/v1/nid/me', {
            method: 'POST',
            headers: config
        })
        .then((response) => {
            console.log('response :::: ', response)
            console.log('id : ' + response.response.id + ', email : ' + response.response.email + ', nickname : ' + response.response.name)
            getEmail(response.response.email);
        })

    })
}

const getTokenGOOGLE = async () => {
    const client_id = '398062070212-aqopvnd41jggo92j6grp5acvevkahca4.apps.googleusercontent.com'
    const client_secret = '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'
    const config = {
        //'Authorization': 'Basic ',
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
    }
    const code = new URL(document.location.toString()).searchParams.get('code')
    const redirect_uri = new URL(document.location.origin ) +'/sign-up'
    await $fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: config,
        body: `grant_type=authorization_code&client_id=${client_id}&redirect_uri=${redirect_uri}&code=${code}&client_secret=${client_secret}`
    })
    .then((data) => {
        //console.log('data: ', data.access_token)
        // config.Authorization += data.access_token
        // token = data.access_token
        // $fetch<KakaoUser>('https://www.googleapis.com/userinfo/v2/me', {
        //     method: 'POST',
        //     headers: config
        // })
        // .then((response) => {
        //     console.log('userinfo response :::: ', response)
        // })

    })
}

const getEmail = async (email:string) => {
    const result = await $fetch<ApiResponse<Data>>('/playground/public/pgMember/get-email?email=' + email, {
        method: 'GET'
    })
    const resData = result.data
    loading.hide()
    console.log('getEmail - resData.mbrNm ::::: ', resData.mbrNm)
    if(resData.mberId == '0' || resData.mberId == null){ //회원가입 필요
        window.alert("회원가입이 필요합니다.")
        param.value.mberEmailAdres = email;
        show.value = true
    }else { //로그인 완료 
        localStorage.setItem('access_token', token)
        store.accessToken = token
        store.userName = resData.mberNm
        window.alert("로그인 완료되었습니다.")
        console.log('getEmail - store.name ::: ', store.userName)
        store.snsLogin = snsLogin
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
    console.log('signUp - resData.mbrNm ::::: ', resData.mberNm)
    store.userName = resData.mberNm
    console.log('onSubmit - store.name ::: ', store.userName)
    localStorage.setItem('access_token', token)
    store.accessToken = token
    loading.hide()
    window.alert("회원가입 완료되었습니다.")
    store.snsLogin = snsLogin
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
    if(val.length < 10) {
        return '전화전호는 10자 이상이어야 합니다.'
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
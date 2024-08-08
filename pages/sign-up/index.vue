<!-- eslint-disable vue/html-self-closing -->
<template>
  <div v-if="show" class="q-pa-md">
    <div class="q-pa-md" style="width: 335px; margin: 0 auto">
      <q-form ref="loginForm" @submit="onSubmit">
        <div class="text-h6" style="margin-bottom: 30px">회원가입</div>
        <div class="q-gutter-y-md column" style="max-width: 300px">
          <q-input
            ref="inpMberId"
            v-model="param.mberId"
            outlined
            label="ID"
            :dense="dense"
            :rules="[idRules]"
          />

          <q-input
            ref="inpMberEmail"
            v-model="param.mberEmailAdres"
            outlined
            label="이메일"
            :dense="dense"
            :rules="[emailRules]"
          />

          <q-btn
            unelevated
            color="primary"
            text-color="white"
            label="중복체크"
            style="margin-bottom: 20px"
            @click="dupCheck"
          />

          <q-input
            v-model="param.mberPassword"
            outlined
            label="비밀번호"
            :dense="dense"
            type="password"
            :rules="[passwordRules]"
          />

          <q-input
            v-model="param.mberPasswordCheck"
            outlined
            label="비밀번호 확인"
            :dense="dense"
            type="password"
            :rules="[passwordCheckRules]"
          />

          <q-input
            v-model="param.mberNm"
            outlined
            label="이름"
            :dense="dense"
            :rules="[nameRules]"
            placeholder="예)홍길동"
          />

          <q-input
            v-model="param.mberBymd"
            outlined
            label="생년월일"
            :dense="dense"
            type="tel"
            maxlength="8"
            :rules="[brdtRules]"
            placeholder="예)19881225"
          />

          <q-btn-toggle
            v-model="param.mberSexdstnCode"
            spread
            no-caps
            toggle-color="primary"
            color="grey-2"
            text-color="black"
            unelevated
            size="sm"
            :options="[
              { label: '남자', value: 'M' },
              { label: '여자', value: 'F' }
            ]"
            padding="11px"
            style="margin-bottom: 20px"
          />

          <q-input
            v-model="param.mberTelno"
            outlined
            label="전화번호"
            :dense="dense"
            type="tel"
            maxlength="11"
            :rules="[telNoRules]"
            placeholder="예)01012345678"
          />

          <br />
          <br />
          <q-btn
            unelevated
            color="primary"
            text-color="white"
            label="회원가입"
            type="submit"
          />
          <q-btn outline color="primary" label="취소" @click="cancel" />
        </div>
      </q-form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { type ApiResponse } from '../../interface/server'

const { loading } = useQuasar()

const router = useRouter()
const show = ref(true)
const dense = ref(true)
const inpMberId = ref<any>(null)
const inpMberEmail = ref<any>(null)
let token: string = ''
const loginForm = ref<any>(null)

interface Data {
  mberId: string
  mberNm: string
  mberBymd: string
  mberSexdstnCode: string
  mberEmailAdres: string
  ciCn: string
  diCn: string
  mberTelno: string
  dupCheckYn: string
}

interface Param {
  mberId: string
  mberPassword: string
  mberPasswordCheck: string
  mberNm: string
  mberBymd: string
  mberSexdstnCode: string
  mberEmailAdres: string
  mberTelno: string
}
interface Token {
  FetchResponse(FetchResponse: any): unknown
  access_token: string
  refresh_token: string
}

let dupCheckYn = ''

const param = ref<Param>({
  mberId: '',
  mberPassword: '',
  mberPasswordCheck: '',
  mberNm: '',
  mberBymd: '',
  mberSexdstnCode: 'M',
  mberEmailAdres: '',
  mberTelno: ''
})

interface KakaoUser {
  kakao_account: {
    email: string
  }
  id: string
  properties: {
    nickname: string
  }
}

interface NaverUser {
  response: {
    id: string
    email: string
    name: string
  }
}

onMounted(() => {
  // loading.show()
  // snsLogin = localStorage.getItem('snsLogin') || ''
  // if(snsLogin == 'KAKAO') {
  //     getTokenKAKAO()
  // }else if(snsLogin == 'NAVER') {
  //     getTokenNAVER()
  // }else if(snsLogin == 'GOOGLE') {
  //     getTokenGOOGLE()
  // }
  //getToken();
})

const _getTokenKAKAO = async () => {
  const client_id = '68ae4b196239138e24e76a6664659155'
  const config = {
    Authorization: 'bearer ',
    'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
  }
  const code = new URL(document.location.toString()).searchParams.get('code')
  const redirect_uri = new URL(document.location.origin) + '/sign-up'
  await $fetch<Token>('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: config,
    body: `grant_type=authorization_code&client_id=${client_id}&redirect_uri=${redirect_uri}&code=${code}`
  }).then((data) => {
    console.debug('data: ', data.access_token)
    config.Authorization += data.access_token
    token = data.access_token
    $fetch<KakaoUser>('https://kapi.kakao.com/v2/user/me', {
      method: 'POST',
      headers: config
    }).then((response) => {
      console.debug(
        'id : ' +
          response.id +
          ', email : ' +
          response.kakao_account.email +
          ', nickname : ' +
          response.properties.nickname
      )
      getEmail(response.kakao_account.email)
    })
  })
}

const _getTokenNAVER = async () => {
  const client_id = 'CzAlAQJdMEto7NeN57QA'
  const client_secret = '4TqLSzR0O7'
  const state = 'RAMDOM_STATE'
  const config = {
    Authorization: 'bearer ',
    'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    // CORS....
    //'Access-Control-Allow-Origin' : '*',
    'x-cors-api-key': 'temp_f4d4037d6e5c605391e488d986cc0a59' // https://proxy.cors.sh/
    //'APIKey': 'COVID_APIKEY' // https://cors-anywhere.herokuapp.com/
  }
  const code = new URL(document.location.toString()).searchParams.get('code')
  const _redirect_uri = encodeURI(
    new URL(document.location.origin) + '/sign-up'
  )
  await $fetch<Token>(
    'https://proxy.cors.sh/' + 'https://nid.naver.com/oauth2.0/token',
    {
      method: 'POST',
      headers: config,
      //mode: 'no-cors',
      body: `grant_type=authorization_code&client_id=${client_id}&client_secret=${client_secret}&code=${code}&state=${state}`
    }
  ).then((data) => {
    config.Authorization += data.access_token
    token = data.access_token
    $fetch<NaverUser>(
      'https://proxy.cors.sh/' + 'https://openapi.naver.com/v1/nid/me',
      {
        method: 'POST',
        headers: config
      }
    ).then((response) => {
      getEmail(response.response.email)
    })
  })
}

const getEmail = async (email: string) => {
  const result = await $fetch<ApiResponse<Data>>(
    '/playground/public/pgMember/get-email?email=' + email,
    {
      method: 'GET'
    }
  )
  const resData = result.data
  loading.hide()
  if (resData.mberId == '0' || resData.mberId == null) {
    //회원가입 필요
    window.alert('회원가입이 필요합니다.')
    param.value.mberEmailAdres = email
    show.value = true
  } else {
    //로그인 완료
    localStorage.setItem('access_token', token)
    window.alert('로그인 완료되었습니다.')
    router.push({ path: '/' })
  }
}

const onSubmit = async () => {
  // const validateResult = loginForm.value?.validate()
  // console.log('validateResult ::: ', validateResult)
  if (dupCheckYn != 'N') {
    window.alert('중복 체크를 해주세요.')
  } else {
    loading.show()
    const result = await $fetch<ApiResponse<Data>>(
      '/playground/public/member/addMber',
      {
        method: 'POST',
        body: JSON.stringify(param.value)
      }
    )
    const _resData = result.data
    loading.hide()
    window.alert('회원가입 완료되었습니다.')
    router.push({ path: '/' })
  }
}

const cancel = () => {
  router.push({ path: '/' })
}

const dupCheck = async () => {
  if (idRules(param.value.mberId) != true) {
    inpMberId.value?.focus()
    return
  }

  if (emailRules(param.value.mberEmailAdres) != true) {
    inpMberEmail.value?.focus()
    return
  }

  loading.show()
  const result = await $fetch<ApiResponse<string>>(
    '/playground/public/member/getMberDupCeck',
    {
      method: 'POST',
      body: JSON.stringify(param.value)
    }
  )
  loading.hide()

  if (result.data == 'Y') {
    window.alert('중복된 회원으로 가입하실 수 없습니다.')
    dupCheckYn = 'Y'
    return
  } else {
    window.alert('회원가입 가능한 ID입니다.')
    dupCheckYn = 'N'
  }
}

const nameRules = (val: string) => {
  if (!val) {
    return '이름을 입력해주세요.'
  }
  if (checkSpecial(val)) {
    return '특수문자는 입력할 수 없습니다.'
  }
  if (val.length < 2) {
    return '이름은 2자 이상이어야 합니다.'
  }
  return true
}

const idRules = (val: string) => {
  if (!val) {
    return 'ID을 입력해주세요.'
  }
  return true
}

const emailRules = (val: string) => {
  if (!val) {
    return '이메일을 입력해주세요.'
  }
  if (emailCheck(val)) {
    return '유효하지 않은 이메일입니다.'
  }
  return true
}

const passwordRules = (val: string) => {
  if (!val) {
    return '비밀번호를 입력해주세요.'
  }
  return true
}

const passwordCheckRules = (val: string) => {
  if (!val) {
    return '비밀번호를 다시 입력해주세요.'
  }
  if (val != param.value.mberPassword) {
    return '비밀번호가 일치하지 않습니다.'
  }

  return true
}

const telNoRules = (val: string) => {
  if (!val) {
    return '전화번호를 입력해주세요.'
  }
  if (checkSpecial(val)) {
    return '특수문자는 입력할 수 없습니다.'
  }
  if (checkNumber(val)) {
    return '숫자만 입력할 수 있습니다.'
  }
  if (val.length < 10) {
    return '전화전호는 10자 이상이어야 합니다.'
  }
  return true
}

const brdtRules = (val: string) => {
  if (!val) {
    return '생년월일을 입력해주세요.'
  }
  if (checkSpecial(val)) {
    return '특수문자는 입력할 수 없습니다.'
  }
  if (checkNumber(val)) {
    return '숫자만 입력할 수 있습니다.'
  }
  if (val.length < 8) {
    return '생년월일은 8자 이상이어야 합니다.'
  }
  return true
}

const checkSpecial = (val: string) => {
  return val.match(/[{}[\]/?.,;:|)*~`!^\-_+<>@#$%&\\=('"]/g)
}

const checkNumber = (val: string) => {
  return !val.match(/\d/g)
}

function emailCheck(email_address: string) {
  const email_regex = /^[\w.-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i
  if (email_regex.test(email_address)) {
    return false
  } else {
    return true
  }
}
</script>

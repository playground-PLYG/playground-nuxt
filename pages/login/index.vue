<template>
    <div class="content">
      <div class="title">
        <div class="text-h4">
          <q-icon name="login" /> LOGIN
        </div>
      </div>
      <div class="search">
        <q-form ref="loginForm"  @submit="login">
          <q-input outlined label="ID"  v-model="param.mberId" :dense="dense" class="input" :rules="[idRules]" style="width: 175px;"/>
          <br>
          <q-input outlined label="PASSWORD"  v-model="param.mberPassword"  type="password" :dense="dense" class="input" :rules="[passwordRules]"  style="width: 175px;"/>
          <br>
          <q-btn push class="button" color="green-7" label="로그인" type="submit"/>
          <q-btn push class="button" color="green-7" label="회원가입" type="submit" to="/sign-up"/>
        </q-form>
      </div>
      <div class="search">
        <q-btn flat padding="none" @click="kakao">
          <img style="width: 180px;" src="../../assets/kakao_login.png">
        </q-btn>
        <br>
        <!-- <br>
        <q-btn flat padding="none" @click="google">
          <img style="width: 180px;" src="../../assets/google_login.png">
        </q-btn>
        <br> -->
        <br>
        <q-btn flat padding="none" @click="naver">
          <img style="width: 180px;" src="../../assets/naver_login.png">
        </q-btn>
      </div>
    </div>

</template>


<script setup lang="ts">
import { useAuthStore } from '../../stores/useAuthStore' 
const store = useAuthStore()
const router = useRouter()
import { type ApiResponse } from '../../interface/server';
const { loading } = useQuasar();
const dense = ref(true)
const loginForm = ref<any>(null)

interface Param {
  mberId: string
  mberPassword:string
}

interface ResData {
  token: string
}

let param = ref<Param>({
    mberId: '',
    mberPassword:''
});

let resData = ref<ResData>({
  token: ''
});

async function kakao() {
  const client_id = '68ae4b196239138e24e76a6664659155'
  const redirect_uri = new URL(document.location.origin ) +'/sign-up'
  const kakaoURL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&prompt=login`
  localStorage.setItem('snsLogin', 'KAKAO')
  await navigateTo(kakaoURL, {
    external: true
  })
}

async function naver() {
  const client_id = 'CzAlAQJdMEto7NeN57QA'
  const redirect_uri = new URL(document.location.origin ) +'sign-up'
  const state = 'RAMDOM_STATE'
  const naverURL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&state=${state}`
  localStorage.setItem('snsLogin', 'NAVER')
  await navigateTo(naverURL, {
    external: true
  })
}

async function google() {
  const client_id = '398062070212-aqopvnd41jggo92j6grp5acvevkahca4.apps.googleusercontent.com'
  const redirect_uri = new URL(document.location.origin ) +'sign-up'
  const scope = 'email profile'
  const googleURL = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}`
  localStorage.setItem('snsLogin', 'GOOGLE')
  await navigateTo(googleURL, {
    external: true
  })
}

const login = async () => {
  loading.show()
  const result = await $fetch<ApiResponse<ResData>>('/playground/public/member/signIn', {
      method: 'POST',
      body: JSON.stringify(param.value) 
  })
  .then(result => {
    loading.hide()
    router.push({ path: "/" });
  })
  .catch(err => {
    loading.hide()
    return
  })
}

const idRules = (val: string) => {
  if(!val){
        return 'ID를 입력해주세요.'
    }
    return true
}

const passwordRules = (val: string) => {
  if(!val){
        return 'PASSWORD를 입력해주세요.'
    }
    return true
}
</script>
<style>
.content {
  margin-top: 3rem;
  margin-left: 5rem;
  margin-right: 5rem;
}

.title {
  margin-top: 3rem;
}

.search {
  margin-top: 2rem;
}

.search .select {
  display: inline-block;
  vertical-align: middle;
  width: 15%;
  padding-right: 0.5rem;
}

.search .input {
  display: inline-block;
  vertical-align: middle;
  width: 15%;
  padding-right: 0.5rem;
}

.search .button {
  margin-right: 0.5rem;
}

.table {
  margin-top: 1rem;
}

.proc {
  margin-top: 1rem;
}

.proc .button {
  margin-right: 0.5rem;
}

.proc .buttonR {
  margin-left: 0.5rem;
  float: right;
}
</style>



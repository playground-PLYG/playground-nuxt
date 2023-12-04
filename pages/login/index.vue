<template>
  <q-page class="q-pl-lg">
    <p class="text-h6 q-pt-md">
      Login
    </p>
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
  </q-page>
</template>


<script setup lang="ts">
import { useAuthStore } from '../../stores/useAuthStore' 
const store = useAuthStore()
const router = useRouter()

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

</script>


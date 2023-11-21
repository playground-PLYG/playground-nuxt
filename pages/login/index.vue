<template>
  <q-page class="q-pl-lg">
    <p class="text-h6 q-pt-md">
      Login
    </p>
    <q-btn flat padding="none" @click="kakao">
      <img src="../../assets/kakao_login.png">
    </q-btn>
  </q-page>
</template>

<script setup lang="ts">

function kakao() {
    const router = useRouter()
    const CLIENT_ID = '68ae4b196239138e24e76a6664659155'
    const REDIRECT_URI = new URL(document.location.origin ) +'/sign-up'
    const kakaoURL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&prompt=login`
    return window.location.href = kakaoURL;
}

</script>


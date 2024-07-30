<!-- eslint-disable vue/html-self-closing -->
<template>
  <div class="content">
    <div class="title">
      <div class="text-h4"><q-icon name="login" /> LOGIN</div>
    </div>
    <div class="search">
      <q-form ref="loginForm" @submit="login">
        <q-input
          v-model="param.mberId"
          outlined
          label="ID"
          :dense="dense"
          class="input"
          :rules="[idRules]"
          style="width: 175px"
        />
        <br />
        <q-input
          v-model="param.mberPassword"
          outlined
          label="PASSWORD"
          type="password"
          :dense="dense"
          class="input"
          :rules="[passwordRules]"
          style="width: 175px"
        />
        <br />
        <q-btn
          push
          class="button"
          color="green-7"
          label="로그인"
          type="submit"
        />
        <q-btn
          push
          class="button"
          color="green-7"
          label="회원가입"
          type="submit"
          to="/sign-up"
        />
      </q-form>
    </div>
    <div class="search">
      <q-btn flat padding="none" @click="kakao">
        <img style="width: 180px" src="../../assets/kakao_login.png" />
      </q-btn>
      <br />
      <br />
      <q-btn flat padding="none" @click="naver">
        <img style="width: 180px" src="../../assets/naver_login.png" />
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useCookie } from 'nuxt/app'
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { type ApiResponse } from '../../interface/server'
import { useAuthStore } from '../../stores/useAuthStore'

const router = useRouter()
const authStore = useAuthStore()
const { loading } = useQuasar()
const dense = ref(true)
const loginForm = ref<any>(null)

interface Param {
  mberId: string
  mberPassword: string
}

interface ResData {
  token: string
  mberId: string
}

const param = ref<Param>({
  mberId: '',
  mberPassword: ''
})

async function kakao() {
  const client_id = '68ae4b196239138e24e76a6664659155'
  const redirect_uri = new URL(document.location.origin) + '/sign-up'
  const kakaoURL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&prompt=login`
  localStorage.setItem('snsLogin', 'KAKAO')
  await router.push(kakaoURL)
}

async function naver() {
  const client_id = 'CzAlAQJdMEto7NeN57QA'
  const redirect_uri = new URL(document.location.origin) + 'sign-up'
  const state = 'RAMDOM_STATE'
  const naverURL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&state=${state}`
  localStorage.setItem('snsLogin', 'NAVER')
  await router.push(naverURL)
}

const login = async () => {
  loading.show()
  const _result = await $fetch<ApiResponse<ResData>>(
    '/playground/public/member/signIn',
    {
      method: 'POST',
      body: JSON.stringify(param.value)
    }
  )
    .then((result) => {
      loading.hide()
      const token = useCookie('token')
      token.value = result.data.token
      authStore.mberId = result.data.mberId
      authStore.token = result.data.token
      const queryString = location.search
      const urlParams = new URLSearchParams(queryString)
      if (urlParams.get('redirectUrl')) {
        router.replace(StringToObject(urlParams.get('redirectUrl')))
      } else {
        router.replace({ path: '/' })
      }
    })
    .catch((_err) => {
      loading.hide()
      return
    })
}

//redirectUrl로 받은 파라미터 변환
const StringToObject = (val: string | null) => {
  if (val == null) {
    return ''
  }
  const queryParam: { [key: string]: any } = {}
  const returnObj = { path: '', query: queryParam }
  const queryAry = val.split('?')
  returnObj.path = '/' + queryAry[0]
  queryAry?.forEach((element, index) => {
    if (index > 0) {
      queryParam[element.split('=')[0]] = element.split('=')[1]
    }
  })

  return returnObj
}

const idRules = (val: string) => {
  if (!val) {
    return 'ID를 입력해주세요.'
  }
  return true
}

const passwordRules = (val: string) => {
  if (!val) {
    return 'PASSWORD를 입력해주세요.'
  }
  return true
}
</script>
<style lang="scss" scoped>
.content {
  margin-top: 3rem;
  margin-left: 5rem;
  margin-right: 5rem;

  .title {
    margin-top: 3rem;
  }

  .search {
    margin-top: 2rem;

    .select {
      display: inline-block;
      vertical-align: middle;
      width: 15%;
      padding-right: 0.5rem;
    }

    .input {
      display: inline-block;
      vertical-align: middle;
      width: 15%;
      padding-right: 0.5rem;
    }

    .button {
      margin-right: 0.5rem;
    }
  }
}
</style>

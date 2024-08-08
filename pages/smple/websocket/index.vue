<template>
  <div class="content q-pa-md q-gutter-md">
    <div class="title">
      <div class="text-h5">websocket 테스트</div>
    </div>

    <q-separator inset />

    <div class="wrap-box">
      <div class="title q-pa-md">
        <div class="text-h6">테스트</div>
      </div>

      <div class="q-pa-md">
        <div class="row">
          <div class="col-5">
            <dk-select
              v-model="messageType"
              :options="messageTypeOption"
              label="messageType"
            />
          </div>
          <div class="col-5">
            <dk-input v-model="senderId" label="senderId" />
          </div>
        </div>
        <div class="row q-mt-xs">
          <div class="col-8">
            <dk-input
              v-model="message"
              label="메시지내용"
              clearable
              autofocus
            />
          </div>
          <div class="col-2 q-ml-lg">
            <dk-btn label="전송" @click="onClickSend" />
          </div>
        </div>
      </div>

      <q-separator inset />

      <div class="q-pa-md">
        <dk-input v-model="txtarea" type="textarea" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import Stomp from 'webstomp-client'
import SockJS from 'sockjs-client'
import { useRuntimeConfig } from 'nuxt/app'
import { useQuasar } from 'quasar'
import { useAuthStore } from '~/stores/useAuthStore'
import type { ApiPagingResponse } from '~/interface/server'
import { commUtil } from '~/utils/comm'

const config = useRuntimeConfig()
const authStore = useAuthStore()
const { loading } = useQuasar()

const messageType = ref<string>('TYPE_01')
const messageTypeOption = ref<string[]>(['TYPE_01', 'TYPE_02', 'HTML'])
const senderId = ref<string>(authStore.mberId || 'test')
const message = ref<string>('')
const txtarea = ref<string>('')

const onClickSend = async () => {
  if (message.value == '') {
    commUtil.alert({
      message: '메시지를 입력해주세요'
    })
  } else {
    loading.show()

    await $fetch<ApiPagingResponse<null>>(
      '/playground/public/sample/websocket/send-all-message',
      {
        method: 'POST',
        body: JSON.stringify({
          messageType: messageType.value,
          senderId: senderId.value,
          message: message.value
        })
      }
    )

    loading.hide()
  }
}

const serverURL = `${config.public.apiBaseUrl}/ws`

onMounted(() => {
  const socket = new SockJS(serverURL)
  const stompClient = Stomp.over(socket)

  stompClient.connect(
    {},
    (frame) => {
      console.debug('소켓 연결 성공', frame)

      stompClient.subscribe('/sub', (response) => {
        console.debug('수신 메시지', response.body)

        const body = JSON.parse(response.body)
        txtarea.value = `${JSON.stringify(body, null, '\t')}\n\n${
          txtarea.value
        }`
      })
    },
    (error) => {
      console.debug('소켓 연결 실패', error)
    }
  )
})
</script>

<style lang="scss" scoped>
.content {
  .wrap-box {
    border: 1px solid lightgrey;

    .editor {
      border: 1px solid lightgrey;
    }
  }
}
</style>

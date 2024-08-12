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

      <div class="q-pa-md q-gutter-sm">
        <q-markup-table flat bordered>
          <colgroup>
            <col style="width: 100px" />
            <col />
          </colgroup>
          <tbody>
            <tr>
              <th scope="row">메시지 유형</th>
              <td>
                <dk-select
                  v-model="messageType"
                  :options="messageTypeOption"
                  label="messageType"
                />
              </td>
            </tr>
            <tr>
              <th scope="row">송신자ID</th>
              <td>
                <dk-input v-model="senderId" label="senderId" />
              </td>
            </tr>
            <tr>
              <th scope="row">메시지 내용</th>
              <td>
                <dk-input
                  v-model="message"
                  label="메시지내용"
                  clearable
                  autofocus
                />
              </td>
            </tr>
            <tr>
              <th scope="row">추가정보</th>
              <td>
                <div v-if="etcList.length == 0" class="row wrapEtcBtn">
                  <dk-btn
                    outline
                    icon="add"
                    padding="xs lg"
                    size="sm"
                    @click="fn_addEtc"
                  />
                </div>
                <div
                  v-for="(etcObj, idx) in etcList"
                  v-else
                  :key="idx"
                  class="row wrapEtcItem q-gutter-sm"
                >
                  <div class="col-4">
                    <dk-input
                      v-model="etcObj.key"
                      outlined
                      label="key"
                      class="q-mb-sm"
                      autofocus
                    />
                  </div>
                  <div class="col-4 q-ml-xs">
                    <dk-input
                      v-model="etcObj.val"
                      outlined
                      label="value"
                      class="q-mb-sm"
                    />
                  </div>

                  <div class="col-2 q-ml-xs q-gutter-sm">
                    <dk-btn
                      outline
                      icon="remove"
                      padding="xs lg"
                      size="sm"
                      @click="fn_removeEtc(idx)"
                    />
                    <dk-btn
                      v-if="idx == etcList.length - 1"
                      outline
                      icon="add"
                      padding="xs lg"
                      size="sm"
                      @click="fn_addEtc"
                    />
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </q-markup-table>

        <div class="row justify-end q-mt-md">
          <div class="col-1 justify-end">
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

const config = useRuntimeConfig()
const authStore = useAuthStore()
const { loading } = useQuasar()

const messageType = ref<string>('TYPE_01')
const messageTypeOption = ref<string[]>(['TYPE_01', 'TYPE_02', 'HTML'])
const senderId = ref<string>(authStore.mberId || 'test')
const message = ref<string>('')
const txtarea = ref<string>('')
const etcList = ref<Array<{ key: string; val: string }>>([])

const onClickSend = async () => {
  if (message.value == '') {
    commUtil.alert({
      message: '메시지를 입력해주세요'
    })
  } else {
    const etcObj: { [key: string]: string } = {}
    if (etcList.value.length > 0) {
      etcList.value.forEach((obj) => (etcObj[obj.key] = obj.val))
    }

    loading.show()

    await $fetch<ApiPagingResponse<null>>(
      '/playground/public/sample/websocket/send-all-message',
      {
        method: 'POST',
        body: JSON.stringify({
          messageType: messageType.value,
          senderId: senderId.value,
          message: message.value,
          etc: etcObj
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

const fn_addEtc = () => {
  etcList.value.push({ key: '', val: null })
}

const fn_removeEtc = (idx: number) => {
  etcList.value.splice(idx, 1)
}
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

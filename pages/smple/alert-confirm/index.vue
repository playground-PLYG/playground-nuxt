<!-- eslint-disable vue/no-v-html -->
<template>
  <div id="q-app">
    <div class="q-pa-md">
      <q-layout
        view="lhh LpR lff"
        container
        style="height: 500px"
        class="shadow-2 rounded-borders q-mb-md"
        :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
      >
        <q-page-container>
          <q-page style="padding-top: 60px" class="q-pa-md bg-white">
            <q-page-sticky position="top" expand class="bg-primary text-white">
              <q-toolbar>
                <q-toolbar-title>[alert] commUtil.alert</q-toolbar-title>
              </q-toolbar>
            </q-page-sticky>

            <div class="q-pa-md row">
              <div class="col-4">
                <q-btn class="q-mb-md" @click="fn_alertCallbackSample"
                  >alert 호출</q-btn
                >

                <br />

                Callback <br />
                <p class="test-result" v-html="alertCallbackResult" />
              </div>

              <q-separator inset vertical class="q-mx-lg" />

              <div class="col-7">
                <code-editor
                  v-model="alertCallbackSampleCode"
                  class="editor"
                  lang="typescript"
                  :options="editorOptions"
                  :style="{ height: '390px' }"
                />
              </div>
            </div>
          </q-page>
        </q-page-container>
      </q-layout>

      <q-layout
        view="lhh LpR lff"
        container
        style="height: 560px"
        class="shadow-2 rounded-borders q-mb-md"
        :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
      >
        <q-page-container>
          <q-page style="padding-top: 60px" class="q-pa-md bg-white">
            <q-page-sticky position="top" expand class="bg-primary text-white">
              <q-toolbar>
                <q-toolbar-title>[alert] commUtil.alertSync</q-toolbar-title>
              </q-toolbar>
            </q-page-sticky>

            <div class="q-pa-md row">
              <div class="col-4">
                <q-btn class="q-mb-md" @click="fn_alertSyncSample"
                  >alertSync 호출</q-btn
                >

                <br />

                result <br />
                <p class="test-result" v-html="alertSyncResult" />
              </div>

              <q-separator inset vertical class="q-mx-lg" />

              <div class="col-7">
                <code-editor
                  v-model="alertSyncSampleCode"
                  class="editor"
                  lang="typescript"
                  :options="editorOptions"
                  :style="{ height: '445px' }"
                />
              </div>
            </div>
          </q-page>
        </q-page-container>
      </q-layout>

      <q-layout
        view="lhh LpR lff"
        container
        style="height: 600px"
        class="shadow-2 rounded-borders q-mb-md"
        :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
      >
        <q-page-container>
          <q-page style="padding-top: 60px" class="q-pa-md bg-white">
            <q-page-sticky position="top" expand class="bg-primary text-white">
              <q-toolbar>
                <q-toolbar-title>[confirm] commUtil.confirm</q-toolbar-title>
              </q-toolbar>
            </q-page-sticky>

            <div class="q-pa-md row">
              <div class="col-4">
                <q-btn class="q-mb-md" @click="fn_confirmCallbackSample"
                  >confirm 호출</q-btn
                >

                <br />

                Callback <br />
                <p class="test-result" v-html="confirmCallbackResult" />
              </div>

              <q-separator inset vertical class="q-mx-lg" />

              <div class="col-7">
                <code-editor
                  v-model="confirmCallbackSampleCode"
                  class="editor"
                  lang="typescript"
                  :options="editorOptions"
                  :style="{ height: '485px' }"
                />
              </div>
            </div>
          </q-page>
        </q-page-container>
      </q-layout>

      <q-layout
        view="lhh LpR lff"
        container
        style="height: 640px"
        class="shadow-2 rounded-borders q-mb-md"
        :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
      >
        <q-page-container>
          <q-page style="padding-top: 60px" class="q-pa-md bg-white">
            <q-page-sticky position="top" expand class="bg-primary text-white">
              <q-toolbar>
                <q-toolbar-title
                  >[confirm] commUtil.confirmSync</q-toolbar-title
                >
              </q-toolbar>
            </q-page-sticky>

            <div class="q-pa-md row">
              <div class="col-4">
                <q-btn
                  label="confirmSync 호출"
                  class="q-mb-md"
                  @click="fn_confirmSyncSample"
                />

                <br />

                result <br />
                <p class="test-result" v-html="confirmSyncResult" />
              </div>

              <q-separator inset vertical class="q-mx-lg" />

              <div class="col-7">
                <code-editor
                  v-model="confirmSyncSampleCode"
                  class="editor"
                  lang="typescript"
                  :options="editorOptions"
                  :style="{ height: '525px' }"
                />
              </div>
            </div>
          </q-page>
        </q-page-container>
      </q-layout>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { commUtil } from '~/utils/comm'

const $q = useQuasar()

const editorOptions = ref({
  theme: 'vs-dark',
  folding: true,
  colorDecorators: true,
  minimap: {
    enabled: false,
    renderCharacters: true,
    showSlider: 'always',
    side: 'right'
  },
  guides: {
    bracketPairs: true,
    bracketPairsHorizontal: true,
    highlightActiveBracketPair: true,
    highlightActiveIndentation: true,
    indentation: true
  },
  readOnly: true
})

// commUtil.alert - start
const alertCallbackMessage = ref<string>('alert 메시지')
const alertCallbackResult = ref<string>('')

const fn_alertCallbackSample = () => {
  commUtil.alert({
    message: alertCallbackMessage.value,
    callbackFn: fn_alertCallbackSampleCallback
  })
}

const fn_alertCallbackSampleCallback = () => {
  alertCallbackResult.value += 'alert callback 함수 호출!<br/>'
}

const alertCallbackSampleCode =
  ref<string>(`import { commUtil } from '~/utils/comm'

const fn_alert호출함수 => () => {
  /**
   * Alert 호출 후 callback 호출
   *
   * @param {DkAlertType} options
   * @property {string?} options.title alert 타이틀 (optional) 
   * @property {string} options.message alert 메시지
   * @property {Function?} options.callbackFn 확인버튼 선택 시 호출 될 callback (optional)
   */
  commUtil.alert({
    message: 'alert 메시지 입니다.',
    callbackFn: fn_alertCallback
  })
}

const fn_alertCallback = () => {
  // 확인 버튼 클릭 후 진행될 코드
}`)
// commUtil.alert - end

// commUtil.alertSync - start
const alertSyncMessage = ref<string>('alert 메시지')
const alertSyncResult = ref<string>('')

const fn_alertSyncSample = async () => {
  await commUtil.alertSync({
    message: alertSyncMessage.value
  })

  alertSyncResult.value += 'alert 확인 버튼 클릭<br/>'
}
const alertSyncSampleCode = ref<string>(`import { commUtil } from '~/utils/comm'

/*
 * Promise를 활용하기 때문에 호출하려는 함수에 async
 * commUtil.alertSync 호출부에 await을 필수로 붙여준다.
 * 
 * 만약 async-await을 붙이지 않은 경우 확인버튼 클릭 전에
 * commUtil.alertSync 호출부 하단 소스가 진행된다.
 */
const fn_alertSync호출함수 => async () => {
  /**
   * async-await Alert 호출 후
   *
   * @param {DkAlertSyncType} options
   * @property {string?} options.title alert 타이틀 (optional) 
   * @property {string} options.message alert 메시지
   */
  await commUtil.alertSync({
    message: 'alert 메시지 입니다.'
  })

  // 확인 버튼 클릭 후 진행될 코드
}`)
// commUtil.alertSync - end

// commUtil.confirm - start
const confirmCallbackMessage = ref<string>('confirm 메시지')
const confirmCallbackResult = ref<string>('')

const fn_confirmCallbackSample = () => {
  commUtil.confirm({
    message: confirmCallbackMessage.value,
    callbackFn: fn_confirmCallbackSampleCallback
  })
}

const fn_confirmCallbackSampleCallback = (isConfirm: boolean) => {
  if (isConfirm) {
    confirmCallbackResult.value +=
      "confirmc callback 함수 호출. '확인' 버튼 클릭<br/>"
  } else {
    confirmCallbackResult.value +=
      "confirmc callback 함수 호출. '취소' 버튼 클릭<br/>"
  }
}

const confirmCallbackSampleCode =
  ref<string>(`import { commUtil } from '~/utils/comm'

const fn_confirm호출함수 => () => {
  /**
   * confirm 호출 후 callback 호출
   *
   * @param {DkConfirmType} options
   * @property {string?} options.title confirm 타이틀 (optional) 
   * @property {string} options.message confirm 메시지
   * @property {Function?} options.callbackFn 확인버튼 선택 시 호출 될 callback.
   *                       - callback함수의 첫번쨰 파라메터로 확인(true)/취소(false) 값 반환
   */
  commUtil.confirm({
    message: 'confirm 메시지 입니다.',
    callbackFn: fn_confirmCallback
  })
}
  
const fn_confirmCallback = (isConfirm: boolean) => {
  if (isConfirm) {
    // 확인 버튼 클릭 후 진행될 코드
  } else {
    // 취소 버튼 클릭 후 진행될 코드
  }
}`)
// commUtil.confirm - end

// commUtil.confirmSync - start
const confirmSyncMessage = ref<string>('confirm 메시지')
const confirmSyncResult = ref<string>('')

const fn_confirmSyncSample = async () => {
  if (
    await commUtil.confirmSync({
      message: confirmSyncMessage.value
    })
  ) {
    confirmSyncResult.value += "'확인' 버튼 클릭<br/>"
  } else {
    confirmSyncResult.value += "'취소' 버튼 클릭<br/>"
  }
}
const confirmSyncSampleCode =
  ref<string>(`import { commUtil } from '~/utils/comm'

/*
 * Promise를 활용하기 때문에 호출하려는 함수에 async
 * commUtil.confirmSync 호출부에 await을 필수로 붙여준다.
 * 
 * 만약 async-await을 붙이지 않은 경우 확인버튼 클릭 전에
 * commUtil.confirmSync 호출부 하단 소스가 진행된다.
 */
const fn_confirmSync호출함수 => async () => {
  /**
   * async-await confirm 호출 후
   *
   * @param {DkConfirmSyncType} options
   * @property {string?} options.title confirm 타이틀 (optional) 
   * @property {string} options.message confirm 메시지
   */
  if (
    await commUtil.confirmSync({
      message: confirmSyncMessage.value
    })
  ) {
    // 확인 버튼 클릭 후 진행될 코드
  } else {
    // 취소 버튼 클릭 후 진행될 코드
  }
}`)
// commUtil.confirmSync - end
</script>

<style lang="scss" scoped>
.editor {
  border: 1px solid lightgrey;
}
</style>

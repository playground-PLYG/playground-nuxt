<template>
  <div class="content q-pa-md q-gutter-md">
    <div class="title">
      <div class="text-h5">이미지 단건 업로드 컴포넌트 샘플</div>
    </div>

    <q-separator inset />

    <div class="content-body">
      <div class="wrap-box">
        <div class="title q-pa-md">
          <div class="text-h6">샘플 코드</div>
        </div>

        <q-separator inset />

        <div class="row justify-center q-pa-md">
          <div class="col-5">
            <code-editor
              v-model="sampleCodeTemplate"
              class="editor"
              lang="html"
              :options="editorOptions"
              :style="{ height: '230px' }"
            />
          </div>

          <q-separator inset vertical class="q-mx-lg" />

          <div class="col-5">
            <code-editor
              v-model="sampleCodeScript"
              class="editor"
              lang="typescript"
              :options="editorOptions"
              :style="{ height: '540px' }"
            />
          </div>
        </div>
      </div>

      <q-separator inset class="q-my-lg" />

      <div class="wrap-box">
        <div class="title q-pa-md">
          <div class="text-h6">삭제된 파일 ID인 경우</div>
        </div>

        <q-separator inset />

        <image-upload
          :file-id="0"
          @file-deleted="fn_fileDeleted"
          @file-uploaded="fn_fileUploaded"
          @file-removed="fn_fileRemoved"
        />
      </div>

      <q-separator inset class="q-my-lg" />

      <div class="wrap-box">
        <div class="title q-pa-md">
          <div class="text-h6">파일 ID가 있는 경우</div>
          <div class="text-subtitle1 text-red">파일 지우지마세요!</div>
        </div>

        <q-separator inset />

        <image-upload
          :file-id="1"
          @file-deleted="fn_fileDeleted"
          @file-uploaded="fn_fileUploaded"
          @file-removed="fn_fileRemoved"
        />
      </div>

      <q-separator inset class="q-my-lg" />

      <div class="wrap-box">
        <div class="title q-pa-md">
          <div class="text-h6">ID가 없는 경우</div>
        </div>

        <q-separator inset />

        <image-upload
          @file-deleted="fn_fileDeleted"
          @file-uploaded="fn_fileUploaded"
          @file-removed="fn_fileRemoved"
        />
      </div>
    </div>

    <q-separator inset class="q-my-lg" />

    <div class="wrap-box">
      <div class="title q-pa-md">
        <div class="text-h6">이미지 확인</div>
      </div>

      <div class="q-pa-md">
        <dk-input
          v-model="imgCheckIdLazy"
          label="이미지파일일련번호"
          @change="
            (val: number) => {
              imgCheckId = val
            }
          "
        />
      </div>

      <q-separator inset />

      <q-img
        :src="imgCheckUrl"
        class="fit"
        :ratio="1"
        fit="contain"
        :img-style="{ borderRadius: '2px' }"
        error-src="/icon/no-image.png"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const imgCheckIdLazy = ref<number>(1)
const imgCheckId = ref<number>(1)
const imgCheckUrl = ref<string>(imageUtil.getImageUrl(1))

watch(imgCheckId, (newVal) => {
  imgCheckUrl.value = imageUtil.getImageUrl(newVal)
})

const editorOptions = ref({
  theme: 'vs-dark',
  folding: true,
  colorDecorators: true,
  minimap: {
    enabled: true,
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

const sampleCodeTemplate = ref<string>(`
<!--
   이미지 단건 업로드 컴포넌트
    - 기존 이미지가 있는 경우 file-id를 props로 전달한다.
-->
<image-upload
  :file-id="0"
  @fileDeleted="fn_fileDeleted"
  @fileUploaded="fn_fileUploaded"
  @fileRemoved="fn_fileRemoved"
/>
`)

const sampleCodeScript = ref<string>(`
/**
 * 기존 이미지가 있는 경우 해당 이미지를 삭제할 때 발생하는 이벤트
 * 
 * @property {string} fileId 삭제된 파일ID
 */
const fn_fileDeleted = (fileId: string) => {
  console.debug('fileDeleted fileId : ', fileId)
}

/**
 * 파일이 서버에 upload된 경우 발생하는 이벤트
 * 
 * @property {string} fileId 삭제된 파일ID
 */
const fn_fileUploaded = (fileId: string) => {
  console.debug('fileUploaded fileId : ', fileId)
}

/**
 * fileUpladed에서 upload된 파일을 삭제한 경우 발생하는 이벤트
 * 
 * @property {string} fileId 삭제된 파일ID
 */
const fn_fileRemoved = (fileId: string) => {
  console.debug('fileRemoved fileId : ', fileId)
}
`)

const fn_fileDeleted = (fileId: number) => {
  console.debug('fileDeleted fileId : ', fileId)
}

const fn_fileUploaded = (fileId: number) => {
  console.debug('fileUploaded fileId : ', fileId)
}

const fn_fileRemoved = (fileId: number) => {
  console.debug('fileRemoved fileId : ', fileId)
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

<template>
  <client-only>
    <div v-show="fileProp.isVisible" class="warp-img q-pa-md">
      <q-card>
        <q-card-section v-if="isViewUploader" horizontal>
          <q-uploader
            ref="uploader"
            class="full-width"
            max-files="1"
            :factory="uploadConfig"
            :accept="fileAccept"
            :max-file-size="maxFileSize"
            :filter="fn_checkFile"
            @rejected="fn_onRejected"
            @uploaded="fn_uploadCallback"
            @failed="fn_uploadCallback"
            @removed="fn_fileRemoved"
            @added="fnFileAdded"
          />
        </q-card-section>

        <q-card-section
          v-if="!isViewUploader"
          horizontal
          class="card-file-info"
        >
          <q-item class="full-width">
            <q-item-section :class="[fileView.isExist ? 'col-6' : 'col-11']">
              <q-item-label class="full-width ellipsis">
                {{ fileView.fileName }}
              </q-item-label>
              <q-item-label v-if="fileView.isExist" caption>
                {{ formatUtil.getBytesToSize(fileView.fileSize) }}
              </q-item-label>
            </q-item-section>

            <q-item-section v-if="fileView.isExist" class="col-5">
              <q-img
                :src="fileView.imageUrl"
                class="fit"
                :ratio="1"
                fit="contain"
                :img-style="{ borderRadius: '2px' }"
                :alt="fileView.fileName"
              />
            </q-item-section>

            <q-item-section top side class="q-my-auto col-1">
              <q-btn
                class="gt-xs"
                size="12px"
                flat
                dense
                round
                icon="delete"
                @click="fn_deleteExistFile"
              />
            </q-item-section>
          </q-item>
        </q-card-section>
      </q-card>
    </div>
  </client-only>
</template>

<script lang="ts" setup>
import { useRuntimeConfig } from 'nuxt/app'
import type { QRejectedEntry, QUploaderFactoryObject } from 'quasar'
import { nextTick, onMounted, ref, toRefs } from 'vue'
import { useQuasar } from 'quasar'
import type { ApiResponse } from '@/interface/server'
import { formatUtil } from '~/utils/format'
import { fileUtil } from '~/utils/file'
import { imageUtil } from '~/utils/image'

const config = useRuntimeConfig()
const { loading } = useQuasar()

const fileExtList = ['.jpg', '.jpeg', '.png', '.gif', 'svg']
const fileTypeList = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml']
const fileAccept = fileExtList.join(',')
const maxFileSize = 8388608 // 8MB

/**
 * 이미지 업로드 Prop
 * @property {number} fileId 기존 업로드된 이미지의 FileId. defalut) -1
 */
interface FileProp {
  fileId?: number
  isVisible?: boolean
}

interface FileInfo {
  fileId: number
  fileName: string
  fileSize: number
  imageUrl?: string
  isExist?: boolean
}

interface TmpFileInfo extends File {
  xhr?: XMLHttpRequest
}

const fileProp = withDefaults(defineProps<FileProp>(), {
  fileId: -1,
  isVisible: true
})

const fileEmit = defineEmits<{
  /**
   * props로 전달된 파일ID의 파일이 삭제되는 경우
   */
  fileDeleted: [fileId: number]
  /**
   * 신규 파일이 업로드되는 경우
   */
  fileUploaded: [fileId: number]
  /**
   * 신규 업로드된 파일이 삭제되는 경우
   */
  fileRemoved: [fileId: number]
  /**
   * 신규 파일을 선책하는 경우
   */
  fileAdded: [file: File]
}>()

const { fileId } = toRefs(fileProp)

const uploader = ref()

const isViewUploader = ref(false)

const fileView = ref<FileInfo>({
  fileId: fileId.value,
  fileName: '',
  fileSize: -1,
  imageUrl: '',
  isExist: false
})

onMounted(async () => {
  await nextTick(fn_getImageFileInfo)
})

const uploadConfig = (): QUploaderFactoryObject => {
  return {
    url: `${config.public.apiBaseUrl}/playground/public/file/saveImage`,
    method: 'POST',
    fieldName: 'file'
  }
}

const fn_getImageFileInfo = async (): Promise<void> => {
  if (fileId.value !== -1) {
    loading.show()

    await $fetch<ApiResponse<FileInfo[]>>(
      '/playground/public/file/getFileList',
      {
        method: 'POST',
        body: JSON.stringify({ fileIds: [fileId.value] })
      }
    )
      .then((result) => {
        const fileInfo = result.data[0]

        fileView.value.fileId = fileInfo.fileId
        fileView.value.fileName = fileInfo.fileName
        fileView.value.fileSize = fileInfo.fileSize
        fileView.value.imageUrl = imageUtil.getImageUrl(fileInfo.fileId)
        fileView.value.isExist = true
      })
      .catch((error) => {
        if (error.data.resultCode == 'EF0001') {
          fileView.value.fileId = fileId.value
          fileView.value.fileName = '삭제된 파일입니다.'
        } else {
          alert(error.data.errorMessage)
        }
      })

    loading.hide()
  } else {
    isViewUploader.value = true
  }
}

const fn_checkFile = (files: readonly File[] | FileList): readonly File[] => {
  return (files as File[]).filter(
    (file: File) =>
      fileExtList.includes('.' + fileUtil.getFileNameExt(file.name)) &&
      fileTypeList.includes(file.type)
  )
}

const fn_onRejected = (rejectedEntries: QRejectedEntry[]) => {
  const rejectedEntry = rejectedEntries[0]

  switch (rejectedEntry.failedPropValidation) {
    case 'accept':
      alert(
        `이미지 파일(${fileAccept})만 업로드 가능합니다. [ ${
          rejectedEntry.file.name
        } - ${formatUtil.getBytesToSize(rejectedEntry.file.size)} ]`
      )
      break
    case 'max-file-size':
    case 'max-total-size':
      alert(
        `파일 업로드 최대 크기는 ${formatUtil.getBytesToSize(
          maxFileSize
        )}입니다. [ ${rejectedEntry.file.name} - ${formatUtil.getBytesToSize(
          rejectedEntry.file.size
        )} ]`
      )
      break
    case 'filter':
      alert(
        `${formatUtil.getBytesToSize(
          maxFileSize
        )}이하의 이미지(${fileAccept}) 파일만 업로드 가능합니다. [ ${
          rejectedEntry.file.name
        } - ${formatUtil.getBytesToSize(rejectedEntry.file.size)} ]`
      )
      break
    case 'max-files':
      alert('하나의 파일만 업로드 가능합니다.')
      break
    case 'duplicate':
      alert('파일이 중복됐습니다.')
      break
  }
}

const fn_uploadCallback = (info: {
  files: readonly File[]
  xhr: XMLHttpRequest
}) => {
  const resData: ApiResponse<FileInfo> = JSON.parse(info.xhr.response)

  if (resData.resultCode == '0000') {
    fileEmit('fileUploaded', resData.data.fileId)
  } else {
    alert('파일 업로드에 실패했습니다.')
    console.error(info)
  }
}

const fn_fileRemoved = async (files: readonly TmpFileInfo[]) => {
  const file = files[0]

  if (file.xhr) {
    const resData: ApiResponse<FileInfo> = JSON.parse(file.xhr.response)

    await $fetch<ApiResponse<void>>('/playground/public/file/removeFile', {
      method: 'POST',
      body: JSON.stringify({ fileId: resData.data.fileId })
    })

    fileEmit('fileRemoved', resData.data.fileId)
  }
}

const fn_deleteExistFile = async () => {
  if (fileView.value.fileSize != -1) {
    await $fetch<ApiResponse<void>>('/playground/public/file/removeFile', {
      method: 'POST',
      body: JSON.stringify({ fileId: fileId.value })
    })
  }

  fileEmit('fileDeleted', fileId.value)

  isViewUploader.value = true
}

const fnFileAdded = (files: readonly TmpFileInfo[]) => {
  fileEmit('fileAdded', files[0])
}

const fn_triggerPickFile = () => {
  uploader.value.pickFiles()
}

const fn_triggerUploadFile = () => {
  uploader.value.upload()
}

defineExpose({ fn_triggerPickFile, fn_triggerUploadFile })
</script>

<style lang="scss" scoped>
.warp-img {
  .card-file-info {
    height: 200px;
  }
}
</style>

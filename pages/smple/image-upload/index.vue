<template>
  <imageUpload
    :file-id="0"
    @fileDeleted="fn_fileDeleted"
    @fileUploaded="fn_fileUploaded"
    @fileRemoved="fn_fileRemoved"
  />
  <br />
  <imageUpload
    :file-id="1"
    @fileDeleted="fn_fileDeleted"
    @fileUploaded="fn_fileUploaded"
    @fileRemoved="fn_fileRemoved"
  />
  <br />
  <imageUpload
    @fileDeleted="fn_fileDeleted"
    @fileUploaded="fn_fileUploaded"
    @fileRemoved="fn_fileRemoved"
  />
</template>

<script lang="ts" setup>
const fn_fileDeleted = (fileId: string) => {
  console.debug('fileDeleted fileId : ', fileId)
}

const fn_fileUploaded = (fileId: string) => {
  console.debug('fileUploaded fileId : ', fileId)
}

const fn_fileRemoved = (fileId: string) => {
  console.debug('fileRemoved fileId : ', fileId)
}
</script>

<style lang="sass" scoped></style>

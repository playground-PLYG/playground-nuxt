<template>
  <div class="content">
    <div class="title">
      <div class="text-h4"><q-icon name="messenger" /> 게시판</div>
    </div>

    <div class="table-container">
      <q-table
        flat
        :rows="notice"
        :columns="columns"
        row-key="boardNm"
        :rows-per-page-options="[0]"
        hide-pagination
        @row-click="rowClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { type QTableProps } from 'quasar'
import { type ApiResponse } from '@/interface/server'
import { useNoticeStore } from '@/stores/useNoticeStore'

interface Notice {
  boardId: string
  boardNm: string
}

const noticeStore = useNoticeStore()
const router = useRouter()

const columns = ref<QTableProps['columns']>([
  { name: 'boardNm', label: '', field: 'boardNm', align: 'center' }
])

const notice = ref<Notice[]>([])

onMounted(() => {
  getNoticeList()
})
const getNoticeList = async () => {
  await $fetch<ApiResponse<Notice[]>>(
    '/playground/public/notice/getNoticeList',
    {
      method: 'GET'
    }
  )
    .then((result) => {
      notice.value = result.data
    })
    .catch((error) => {
      console.error(error)
    })
}

const rowClick = (evt: Event, row: any) => {
  noticeStore.boardId = row.boardId
  noticeStore.boardNm = row.boardNm
  router.push({ path: '/post' })
}
</script>

<style lang="scss" scoped>
.content {
  margin-top: 3rem;
  margin-left: 5rem;
  margin-right: 5rem;
}

.title {
  margin-top: 3rem;
}
</style>

<template>
  <div class="content">
    <div class="title">
      <div class="text-h4"><q-icon name="messenger" /> 공지사항</div>
    </div>
    <div class="search">
      <div class="q-gutter-md row items-start">
        <q-input
          outlined
          v-model="param.noticeSj"
          label="제목"
          round
          dense
          flat
          class="input"
        />

        <q-btn
          push
          color="green-7"
          class="button"
          label="조회"
          @click="getPostList"
          value="getPostList"
        ></q-btn>
        <q-btn
          push
          color="green-7"
          class="button"
          label="초기화"
          @click="resetForm"
        />
      </div>
    </div>
    <div class="search">
      <div class="table-container">
        <q-table
          flat
          bordered
          :rows="post"
          :columns="columns"
          row-key="boardNm"
          :rows-per-page-options="[0]"
          @row-click="rowClick"
        />
      </div>

      <div class="left-align">
        <q-btn color="blue" label="게시물 작성" @click="insert" />
      </div>
    </div>

    <div class="q-pa-md q-gutter-sm">
      <q-dialog v-model="prompt" persistent>
        <q-card style="min-width: 600px">
          <q-form class="q-gutter-md">
            <q-card-section>
              <div class="text-h6">게시물 생성</div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <q-input
                dense
                v-model="insertPost.noticeSj"
                autofocus
                label="제목"
                filled
                :rules="[title_rules]"
              />
              <q-input
                dense
                v-model="insertPost.noticeCn"
                label="내용"
                type="textarea"
                filled
                :rules="[content_rules]"
              />
            </q-card-section>
            <q-card-actions align="right" class="text-primary">
              <q-btn
                flat
                label="닫기"
                type="reset"
                v-close-popup
                @click="closePost"
              />
              <q-btn
                flat
                label="등록"
                type="submit"
                v-close-popup
                @click="createPost"
              />
            </q-card-actions>
          </q-form>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { type ApiResponse } from '@/interface/server'
import { useNoticeStore } from '@/stores/useNoticeStore'
import { type QTableProps, date } from 'quasar'

interface Post {
  boardId: string
  noticeCn: string
  noticeSj: string
}
interface Data {
  boardId: string
  noticeSj: string
}
const param = ref<Data>({
  boardId: 'smile', // 임시 하드코딩
  noticeSj: ''
})

const insertPost = ref<Post>({
  boardId: 'smile', // 임시 하드코딩
  noticeCn: '',
  noticeSj: ''
})

// 반응형 상태 변수 초기화
const post = ref<Post[]>([])
const prompt = ref(false)

const noticeStore = useNoticeStore()
const router = useRouter()

const columns = ref<QTableProps['columns']>([
  { name: 'noticeNo', label: '순번', field: 'noticeNo', align: 'center' },
  { name: 'noticeSj', label: '제목', field: 'noticeSj', align: 'center' },
  { name: 'registUsrId', label: '등록자', field: 'registUsrId', align: 'left' },
  {
    name: 'registDt',
    label: '등록일시',
    field: 'registDt',
    align: 'left',
    format: (val) => (val ? date.formatDate(val, 'YYYY-MM-DD HH:mm') : val)
  },
  { name: 'updtUsrId', label: '수정자', field: 'updtUsrId', align: 'left' },
  {
    name: 'updtDt',
    label: '수정일시',
    field: 'updtDt',
    align: 'left',
    format: (val) => (val ? date.formatDate(val, 'YYYY-MM-DD HH:mm') : val)
  }
])

onMounted(() => {
  getPostList()
})

const getPostList = async () => {
  //param.value.boardId = noticeStore.boardId //임시 주석
  await $fetch<ApiResponse<Post[]>>('/playground/public/post/getPostList', {
    method: 'POST',
    body: JSON.stringify(param.value)
  })
    .then((result) => {
      post.value = result.data
    })
    .catch((error) => {
      console.error(error)
    })
}

const rowClick = (evt: Event, row: any, index: number) => {
  noticeStore.boardId = row.boardId
  noticeStore.boardNm = '공지사항' //임시 하드코딩
  noticeStore.noticeCn = row.noticeCn
  noticeStore.noticeSj = row.noticeSj
  noticeStore.noticeNo = row.noticeNo
  noticeStore.registUsrId = row.registUsrId

  router.push({ path: '/post/postDetail' })
}

const insert = () => {
  prompt.value = true
}

const createPost = async () => {
  await $fetch<ApiResponse<Post[]>>('playground/api/post/addPost', {
    method: 'POST',
    body: JSON.stringify(insertPost.value)
  })
    .then((result) => {
      closePost()
    })
    .catch((error) => {
      console.log(error)
    })
}

const closePost = () => {
  prompt.value = false
  insertPost.value = {
    boardId: '',
    noticeCn: '',
    noticeSj: ''
  }
}

const title_rules = (val: string) => {
  if (!val) {
    return '제목을 입력해주세요.'
  }
  return true
}

const content_rules = (val: string) => {
  if (!val) {
    return '게시물의 내용을 입력해주세요.'
  }
  return true
}

const resetForm = () => {
  param.value.noticeSj = ''
  getPostList()
}
</script>

<style lang="scss" scoped>
.left-align {
  display: flex;
  justify-content: flex-start;
  margin-top: 1rem;
}
</style>

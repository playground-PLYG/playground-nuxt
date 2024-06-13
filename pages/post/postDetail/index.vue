<template>
  <div class="q-pa-md">
    <div class="text-h4">
      <q-icon name="messenger" /> {{ noticeStore.boardNm }}
    </div>

    <q-card class="q-mt-md">
      <q-card-section>
        <div class="text-h5">{{ noticeStore.noticeSj }}</div>
        작성자 : {{ noticeStore.registUsrId }}
      </q-card-section>
      <q-card-section>
        <div>{{ noticeStore.noticeCn }}</div>
      </q-card-section>
    </q-card>
    <q-card>
      <q-card-section>
        댓글
        <div v-for="comment in comments" :key="comment.commentNo">
          <CommentItem :comment="comment" />
        </div>
      </q-card-section>
    </q-card>
    <q-card>
      <q-card-section> 댓글 달기 </q-card-section>
      <q-card-section class="q-pt-none">
        <q-input
          v-model="newComment"
          label="댓글을 입력하세요"
          type="textarea"
          filled
        />
        <div class="right-align">
          <q-btn color="primary" label="댓글 작성" @click="addComment" />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNoticeStore } from '@/stores/useNoticeStore'
import { type ApiResponse } from '@/interface/server'
import CommentItem from './CommentItem.vue'

interface Comment {
  boardId: string
  noticeNo: number
  commentNo: number
  commentCn: string
  upperCommentNo: number | null
  deleteChk: string
  commentList?: Comment[]
  registUsrId: string
}

interface CommentAdd {
  boardId: string
  noticeNo: number
  commentCn: string
  upperCommentNo: number | null
}

const comments = ref<Comment[]>([])
const newComment = ref<string>('')
const commentList = {
  boardId: 'smile', // 임시 하드코딩
  noticeNo: 0
}

const noticeStore = useNoticeStore()

onMounted(async () => {
  getCommentList()
})

const getCommentList = async () => {
  commentList.noticeNo = Number(noticeStore.noticeNo)
  await $fetch<ApiResponse<Comment[]>>(
    '/playground/public/comment/getCommentList',
    {
      method: 'POST',
      body: JSON.stringify(commentList)
    }
  )
    .then((result) => {
      comments.value = result.data
    })
    .catch((error) => {
      console.error(error)
    })
}
const addComment = async () => {
  if (!newComment.value.trim()) {
    alert('댓글을 입력하세요.')
    return
  }

  const commentToAdd: CommentAdd = {
    boardId: commentList.boardId,
    noticeNo: commentList.noticeNo,
    commentCn: newComment.value,
    upperCommentNo: null
  }

  await $fetch<ApiResponse<Comment>>('/playground/api/comment/addComment', {
    method: 'POST',
    body: JSON.stringify(commentToAdd)
  })
    .then((result) => {
      getCommentList()
    })
    .catch((error) => {
      console.error(error)
    })

  newComment.value = ''
}
</script>

<style lang="scss" scoped>
.q-pa-md {
  padding: 16px;
  margin: 8px;
}

.q-card {
  margin-top: 16px;
}

.q-pt-none {
  padding-top: 0;
}

.right-align {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}
</style>

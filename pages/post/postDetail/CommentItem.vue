<template>
  <div class="comment-item">
    <div class="comment-content">
      <div class="comment-text">
        <strong>{{ comment.registUsrId }}</strong
        >:
        {{
          comment.deleteChk === 'Y' ? '삭제된 댓글입니다' : comment.commentCn
        }}
      </div>
    </div>
    <div v-if="comment.deleteChk === 'N'">
      <a class="reply-button" @click="reInsert">답글</a>
      <a class="edit-button" @click="editComment"> 수정</a>
      <a class="delete-button" @click="delComment"> 삭제</a>
    </div>
    <div
      v-if="comment.commentList && comment.commentList.length"
      class="comment-replies"
    >
      <CommentItem
        v-for="childComment in comment.commentList"
        :key="childComment.commentNo"
        :comment="childComment"
      />
    </div>
  </div>
  <template>
    <div class="q-pa-md q-gutter-sm">
      <q-dialog v-model="prompt" persistent>
        <q-card style="min-width: 600px">
          <q-form class="q-gutter-md">
            <q-card-section>
              <div class="text-h6">
                {{ isDel ? '댓글 삭제' : isEdit ? '댓글 수정' : '대댓글 작성' }}
              </div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <q-input
                v-model="insertComment.commentCn"
                autofocus
                label="댓글"
                :disable="isDel"
                filled
                :rules="[comment_rules]"
              />
            </q-card-section>
            <q-card-actions align="right" class="text-primary">
              <q-btn
                flat
                label="닫기"
                type="reset"
                v-close-popup
                @click="closeComment"
              />
              <q-btn
                flat
                :label="isDel ? '삭제' : '등록'"
                type="reset"
                @click="registration"
              />
            </q-card-actions>
          </q-form>
        </q-card>
      </q-dialog>
    </div>
  </template>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue'

import { type ApiResponse } from '../../../interface/server'

const props = defineProps<{ comment: Comment }>()

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

interface CommentData {
  boardId: string
  noticeNo: number
  commentCn: string
  upperCommentNo: number | null
}

let prompt = ref(false)
let isEdit = ref(false)
let isDel = ref(false)

let insertComment = ref<CommentData>({
  boardId: '',
  noticeNo: 0,
  commentCn: '',
  upperCommentNo: 0
})

const reInsert = async () => {
  prompt.value = true
  isEdit.value = false
}

const registration = () => {
  if (isEdit.value) {
    modifyComment()
  } else if (isDel.value) {
    console.log('delete :: ')
    removeComment()
  } else {
    console.log('reComment :: ')
    createReComment()
  }
}

const createReComment = async () => {
  console.log(props.comment)

  const commentToAdd: CommentData = {
    boardId: props.comment.boardId,
    noticeNo: props.comment.noticeNo,
    commentCn: insertComment.value.commentCn,
    upperCommentNo: props.comment.commentNo
  }

  console.log('insert Comment ::', commentToAdd)

  await $fetch<ApiResponse<CommentData>>('/playground/api/comment/addComment', {
    method: 'POST',
    body: JSON.stringify(commentToAdd)
  })
    .then((result) => {
      console.log('comment CC Test :: ', result)
      prompt.value = false
      window.location.reload()
    })
    .catch((error) => {
      console.error(error)
    })
}

const closeComment = async () => {
  prompt.value = false
  isDel.value = false
  insertComment.value.commentCn = ''
}

const comment_rules = (val: string) => {
  if (!val) {
    return '댓글을 입력해주세요.'
  }
  return true
}

const editComment = () => {
  isEdit.value = true
  insertComment.value.commentCn = props.comment.commentCn
  prompt.value = true
}

const modifyComment = async () => {
  const commentUpdate = {
    commentNo: props.comment.commentNo,
    commentCn: insertComment.value.commentCn
  }

  await $fetch<ApiResponse<CommentData>>(
    '/playground/api/comment/modifyComment',
    {
      method: 'POST',
      body: JSON.stringify(commentUpdate)
    }
  )
    .then((result) => {
      console.log('comment CC Test :: ', result)
      prompt.value = false
      window.location.reload()
    })
    .catch((error) => {
      console.error(error)
    })
}

const delComment = () => {
  isDel.value = true
  insertComment.value.commentCn = props.comment.commentCn
  prompt.value = true
}

const removeComment = async () => {
  const commentRemove = {
    commentNo: props.comment.commentNo
  }

  console.log('comment ReMove Date :: ', commentRemove)

  await $fetch<ApiResponse<CommentData>>(
    '/playground/api/comment/removeComment',
    {
      method: 'DELETE',
      body: JSON.stringify(commentRemove)
    }
  )
    .then((result) => {
      prompt.value = false
      isDel.value = false
      window.location.reload()
    })
    .catch((error) => {
      console.log('error :: ', error)
    })
}
</script>

<style scoped>
.comment-item {
  padding: 5px;
  border-radius: 40px;
}

.comment-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-text {
  flex-grow: 1;
}

.reply-button,
.edit-button,
.delete-button {
  cursor: pointer;
  color: blue;
}

.comment-replies {
  margin-left: 20px;
  padding-left: 10px;
}
</style>

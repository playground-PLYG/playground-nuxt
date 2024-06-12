<template>
  <div class="content">
    <div class="title">
      <div class="text-h4">
        <q-icon name="messenger" /> {{ noticeStore.boardNm }}
      </div>
    </div>
    <div class="search">
      <div class="table-container">
        <q-table
          flat
          :rows="post"
          :columns="columns"
          row-key="boardNm"
          :rows-per-page-options="[0]"
          @row-click="rowClick"
          hide-pagination
        />
      </div>
      <div class="right-align">
        <q-btn color="blue" label="게시물 작성" @click="insert" />
      </div>
    </div>
  </div>
  <template>
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
  </template>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { type ApiResponse } from "../../interface/server";
import { useNoticeStore } from "../../stores/useNoticeStore";
import { type QTableProps } from "quasar";

interface Post {
  boardId: string;
  noticeCn: string;
  noticeSj: string;
}
interface Data {
  boardId: String;
}
let param = ref<Data>({
  boardId: "smile", // 임시 하드코딩
});

let insertPost = ref<Post>({
  boardId: "smile", // 임시 하드코딩
  noticeCn: "",
  noticeSj: "",
});

// 반응형 상태 변수 초기화
let post = ref<Post[]>([]);
let prompt = ref(false);

const noticeStore = useNoticeStore();
const router = useRouter();

const columns = ref<QTableProps["columns"]>([
  { name: "noticeSj", label: "제목", field: "noticeSj", align: "center" },
  {
    name: "registUsrId",
    label: "작성자ID",
    field: "registUsrId",
    align: "center",
  },
]);

onMounted(async () => {
  getPostList();
});

const getPostList = async () => {
  // param.value.boardId = noticeStore.boardId; //임시 주석
  await $fetch<ApiResponse<Post[]>>("/playground/public/post/getPostList", {
    method: "POST",
    body: JSON.stringify(param.value),
  })
    .then((result) => {
      post.value = result.data;
    })
    .catch((error) => {
      console.error(error);
    });
};

const rowClick = (evt: Event, row: any, index: number) => {
  noticeStore.boardId = row.boardId;
  noticeStore.boardNm = "공지사항"; //임시 하드코딩
  noticeStore.noticeCn = row.noticeCn;
  noticeStore.noticeSj = row.noticeSj;
  noticeStore.noticeNo = row.noticeNo;
  noticeStore.registUsrId = row.registUsrId;

  router.push({ path: "/post/postDetail" });
};

const insert = async () => {
  prompt.value = true;
};

const createPost = async () => {
  await $fetch<ApiResponse<Post[]>>("playground/api/post/addPost", {
    method: "POST",
    body: JSON.stringify(insertPost.value),
  })
    .then((result) => {
      console.log("result ::", result);
      prompt.value = false;
      insertPost.value = {
        boardId: "",
        noticeCn: "",
        noticeSj: "",
      };
    })
    .catch((error) => {
      console.log(error);
    });
};

const closePost = async () => {
  prompt.value = false;
  insertPost.value = {
    boardId: "",
    noticeCn: "",
    noticeSj: "",
  };
};

const title_rules = (val: string) => {
  if (!val) {
    return "제목을 입력해주세요.";
  }
  return true;
};

const content_rules = (val: string) => {
  if (!val) {
    return "게시물의 내용을 입력해주세요.";
  }
  return true;
};
</script>

<style scoped>
.right-align {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem; /* 버튼 위에 공간을 추가하고 싶다면 */
}
</style>

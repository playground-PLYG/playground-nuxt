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
        @row-click="rowClick"
        hide-pagination
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { type ApiResponse } from "../../interface/server";
import { useNoticeStore } from "../../stores/useNoticeStore";
//import axios from 'axios';
import { type QTableProps } from "quasar";

interface Notice {
  boardId: string;
  boardNm: string;
}

interface Post {
  boardId: string;
  nttSn: number;
  nttSj: string;
  nttCn: string;
}

const noticeStore = useNoticeStore();
const router = useRouter();

const columns = ref<QTableProps["columns"]>([
  { name: "boardNm", label: "", field: "boardNm", align: "center" },
]);

const notice = ref<Notice[]>([]);

onMounted(async () => {
  getNoticeList();
});
const getNoticeList = async () => {
  await $fetch<ApiResponse<Notice[]>>(
    "/playground/public/notice/getNoticeList",
    {
      method: "GET",
    }
  )
    .then((result) => {
      notice.value = result.data;
    })
    .catch((error) => {
      console.error(error);
    });
};

const rowClick = (evt: Event, row: any, index: number) => {
  noticeStore.boardId = row.boardId;
  noticeStore.boardNm = row.boardNm;
  router.push({ path: "/post" });
};
</script>
<style>
.example-item {
  height: 200px;
  width: 200px;
  margin-top: 1rem;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}

.content {
  margin-top: 3rem;
  margin-left: 5rem;
  margin-right: 5rem;
}

.title {
  margin-top: 3rem;
}

.search {
  margin-top: 2rem;
}

.search .select {
  display: inline-block;
  vertical-align: middle;
  width: 15%;
  padding-right: 0.5rem;
}

.search .input {
  display: inline-block;
  vertical-align: middle;
  width: 15%;
  padding-right: 0.5rem;
}

.search .button {
  margin-right: 0.5rem;
}

.table {
  margin-top: 1rem;
}

.proc {
  margin-top: 1rem;
}

.proc .button {
  margin-right: 0.5rem;
}

.proc .buttonR {
  margin-left: 0.5rem;
  float: right;
}
</style>

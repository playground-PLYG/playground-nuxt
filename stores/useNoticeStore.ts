import { defineStore } from "pinia";

export const useNoticeStore = defineStore("notice", {
  state: () => ({
    boardId: "",
    boardNm: "",
    noticeCn: "",
    noticeSj: "",
    noticeNo: "",
    registUsrId: "",
  }),
  actions: {
    // actions 설정
  },
  persist: true,
});

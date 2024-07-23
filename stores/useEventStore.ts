import { defineStore } from 'pinia'

export const useEventStore = defineStore('event', {
  state: () => ({
    eventSn: '',
    updateYn: 'N',
    progrsSttus: ''
  }),
  actions: {
    // actions 설정
  },
  persist: true
})

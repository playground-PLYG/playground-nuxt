<template>
  <client-only>
    <div class="q-pa-lg flex flex-center">
      <q-select
        v-model="pageSizeModel"
        class="q-pa-lg flex flex-left"
        default="5"
        outlined
        :options="pageSizeOptions"
        rounded
        stack-label
        color="secondary"
        @update:model-value="pageSizeUpdate"
      />
      <q-pagination
        v-model="currentPage"
        :max="totalPage"
        direction-links
        boundary-links
        @update:model-value="movePage"
      />
    </div>
  </client-only>
</template>

<script setup lang="ts">
import { ref, toRefs } from 'vue'

interface Props {
  totalPage: number
  currentPage: number
}

const props = defineProps<Props>()
const { totalPage, currentPage } = toRefs(props)

const page = ref<number>(1)
const pageSize = ref<number>(5)
const emit = defineEmits(['send-event'])

const pageSizeModel = ref({ label: 5 })
const pageSizeOptions = [5, 10, 15, 20, 25, 30]

const movePage = (evt: any) => {
  emit('send-event', evt, 'pageNum')
  page.value = evt
}

const pageSizeUpdate = (evt: any) => {
  emit('send-event', evt, 'pageSize')
  pageSize.value = evt
}
</script>

<style>
.content {
  margin-top: 3rem;
  margin-left: 5rem;
  margin-right: 5rem;
}
</style>

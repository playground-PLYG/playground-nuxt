<template>
    <div class="q-pa-lg flex flex-center">
      <q-pagination
        v-model="currentPage"
        :max="totalPage"
        direction-links
        boundary-links
        @update:model-value="movePage"
      />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props{
  totalPage: number,
  currentPage: number
}

const props = defineProps<Props>()
const { totalPage, currentPage } = toRefs(props)

const page = ref<number>(1)
const emit = defineEmits(['send-event'])

const movePage = (evt: any) => {
  emit("send-event", evt)
  page.value = evt
}

</script>

<style>

.content {
  margin-top: 3rem;
  margin-left: 5rem;
  margin-right: 5rem;
}

</style>
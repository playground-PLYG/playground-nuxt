<template>
  <!-- 메인 영역 시작 -->
  <div>
    <!-- 조회조건 영역 start -->
    <div class="mobile-content-area">
      <q-input
        v-model="text"
        stack-label
        label="투표제목"
        clearable
        :max-length="20"
      />

      <q-input v-model="text" stack-label label="투표시작" clearable />
      <q-input v-model="text" stack-label label="투표종료" clearable />
    </div>
    <!-- 조회조건 영역 end -->
  </div>
  <!-- 메인 영역 종료 -->
</template>

<!-- 함수정의 -->
<script setup lang="ts">
import { ref } from 'vue'

const text = ref<string>()
</script>

<!-- css -->
<style lang="scss" scoped>
.mobile-content-area {
  margin-top: 1rem;
  margin-left: 1rem;
  margin-right: 1rem;
  margin-bottom: 1rem;
}

.mobile-content-area > label {
  margin-bottom: 15px;
}
</style>

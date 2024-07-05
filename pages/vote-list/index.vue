<template>
  <!-- 메인 영역 시작 -->
  <div>
    <!-- 조회조건 영역 start -->
    <div class="mobile-search-area">
      <q-input v-model="text" outlined label="투표제목" maxlength="12">
        <template #append>
          <q-icon
            v-if="text !== ''"
            name="close"
            class="cursor-pointer"
            @click="text = ''"
          />
          <q-icon name="search" />
        </template>
        <template #after>
          <q-btn push color="white" text-color="primary" label="등록" />
        </template>
      </q-input>
    </div>
    <!-- 조회조건 영역 end -->
    <q-separator spaced="12px" />

    <div class="q-gutter-y-md">
      <q-card>
        <q-tabs
          v-model="tab"
          dense
          class="text-grey-7 vote-tab"
          active-color="blue-9"
          indicator-color="blue"
          align="justify"
        >
          <q-tab name="mails" label="투표중" />
          <q-tab name="alarms" label="준비중" />
          <q-tab name="movies" label="투표완료" />
        </q-tabs>

        <q-tab-panels v-model="tab" animated class="text-blue vote-list">
          <q-tab-panel name="mails">
            <q-intersection
              v-for="index in 10"
              :key="index"
              transition="flip-right"
              class="vote-item"
            >
              <q-item v-ripple clickable>
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white"> Q </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label>투표{{ index }} 번</q-item-label>
                  <q-item-label caption lines="1"
                    >투표기간 From-to</q-item-label
                  >
                </q-item-section>

                <!-- 내가한 투표 표시 -->
                <q-item-section v-if="index % 2 == 0" side>
                  <q-badge rounded color="green" />
                </q-item-section>
              </q-item>
            </q-intersection>
          </q-tab-panel>

          <q-tab-panel name="alarms">
            <q-intersection
              v-for="index in 10"
              :key="index"
              transition="flip-right"
              class="vote-item"
            >
              <q-item v-ripple clickable>
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white"> Q </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label>투표{{ index }} 번</q-item-label>
                  <q-item-label caption lines="1"
                    >투표기간 From-to</q-item-label
                  >
                </q-item-section>

                <q-item-section side>
                  <q-badge rounded color="green" />
                </q-item-section>
              </q-item>
            </q-intersection>
          </q-tab-panel>

          <q-tab-panel name="movies">
            <q-intersection
              v-for="index in 10"
              :key="index"
              transition="flip-right"
              class="vote-item"
            >
              <q-item v-ripple clickable>
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white"> Q </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label>투표{{ index }} 번</q-item-label>
                  <q-item-label caption lines="1"
                    >투표기간 From-to</q-item-label
                  >
                </q-item-section>

                <q-item-section side>
                  <q-badge rounded color="green" />
                </q-item-section>
              </q-item>
            </q-intersection>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </div>
  <!-- 메인 영역 종료 -->
</template>

<!-- 함수정의 -->
<script setup lang="ts">
import { ref } from 'vue'

const text = ref<string>()
const tab = ref()
</script>

<!-- css -->
<style lang="scss" scoped>
.mobile-search-area {
  margin-top: 1rem;
  margin-left: 1rem;
  margin-right: 1rem;
}

.vote-item {
  margin-bottom: 10px;
  border-bottom: ridge;
}

.vote-list {
  padding: 0px 0px 0px 0px;
}

.vote-tab {
  height: 50px;
}
</style>

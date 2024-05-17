<script setup lang="ts">
import { ref } from 'vue';
import type { EssentialLinkProps } from '@/components/EssentialLink.vue';
import { type ApiResponse } from '../interface/server';
import { useAuthStore } from '../stores/useAuthStore' 
const { loading } = useQuasar()
const authStore = useAuthStore();

// api로 조회할 데이터 구조
interface MenuData {
  menuId: string
  menuNm: string
  menuUrl: string
}

let essentialLinks = ref<EssentialLinkProps[]>([])

const iconList = ['school', 'code', 'chat', 'record_voice_over', 'rss_feed', 'public', 'favorite']

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const selectMenu = async () => {
  loading.show()
  await $fetch<ApiResponse<MenuData>>(
    "/playground/public/menu/select", 
    { method: 'GET' }
    )
    .then(({ data }) => {
      setMenu(data)
    })
    .catch((error) => {
      console.error('error: ', error)
      alert('메뉴 목록을 불러오지 못했습니다.')
      return
    })
  loading.hide()
}

const setMenu = (arr: object) => {
  // const menu = Object.entries(resData)
  // const menu = Object.keys(resData)
  const menu = Object.values(arr)
  
  menu.forEach((item, idx) => {
    const menuItem: EssentialLinkProps = {
      title: item.menuNm,
      icon: iconList[idx],
      link: item.menuUrl
    }
    essentialLinks.value.push(menuItem)
  })
}

onMounted(() => {
  selectMenu()
})
</script>
<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          :glossy="false"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          Quasar App
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label header v-if="authStore.mberId">
          {{authStore.mberId}}님 반가워요! 
        </q-item-label>
        <template v-for="(menuItem, index) in essentialLinks" :key="index">
          <q-item clickable :to="menuItem.link">
            <q-item-section avatar>
              <q-icon :name="menuItem.icon" />
            </q-item-section>
            <q-item-section>
              {{ menuItem.title }}
            </q-item-section>

          </q-item>
        </template>
        <q-item clickable v-if="authStore.isLogin" exact @click="authStore.logout()">
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>
            Logout
          </q-item-section>
        </q-item>
        <q-item clickable v-else to="/login" exact >
          <q-item-section avatar>
            <q-icon name="login" />
          </q-item-section>
          <q-item-section>
            Login
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <slot />
    </q-page-container>
  </q-layout>
</template>

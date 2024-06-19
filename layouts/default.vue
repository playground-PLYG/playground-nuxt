<script setup lang="ts">
import { ref } from 'vue'
import type { EssentialLinkProps } from '@/components/EssentialLink.vue'
import { type ApiResponse } from '../interface/server'
import { useAuthStore } from '../stores/useAuthStore'
const { loading } = useQuasar()
const authStore = useAuthStore()

// api로 조회할 데이터 구조
interface MenuData {
  menuId: string
  menuNm: string
  menuUrl: string
}

interface Data {
  mberId: string
}

let param = ref<Data>({
  mberId: authStore.mberId
})

let essentialLinks = ref<EssentialLinkProps[]>([])
let essentialLowerLinks = ref<EssentialLinkProps[]>([])

const iconList = ['']

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const selectMenu = async () => {
  loading.show()
  await $fetch<ApiResponse<MenuData>>('/playground/public/menu/select', {
    method: 'POST',
    body: JSON.stringify(param.value)
  })
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
      link: item.menuUrl,
      menuSn: item.menuSn,
      upperMenuSn: item.upperMenuSn,
      lwprtMenuHoldAt: item.lwprtMenuHoldAt,
      open: false
    }

    if (item.upperMenuSn != null) {
      essentialLowerLinks.value.push(menuItem)
    } else {
      menuItem.icon = 'chevron_right'

      if (menuItem.lwprtMenuHoldAt == 'Y') {
        menuItem.link = ''
      }
      essentialLinks.value.push(menuItem)
    }
  })
}

const toggleMenu = (menuItem: object) => {
  menuItem.open = !menuItem.open
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

        <q-toolbar-title> Playground </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list bordered>
        <q-item-label header v-if="authStore.mberId">
          {{ authStore.mberId }}님 반가워요!
        </q-item-label>
        <template v-for="(menuItem, index) in essentialLinks" :key="index">
          <q-item clickable :to="menuItem.link" @click="toggleMenu(menuItem)">
            <q-item-section avatar>
              <q-icon
                :name="
                  menuItem.lwprtMenuHoldAt == 'N'
                    ? menuItem.icon
                    : menuItem.open
                    ? 'expand_less'
                    : 'expand_more'
                "
              />
            </q-item-section>
            <q-item-section>
              {{ menuItem.title }}
            </q-item-section>
          </q-item>
          <template v-for="(menuChild, idx) in essentialLowerLinks" :key="idx">
            <q-slide-transition
              v-show="menuItem.open"
              v-if="menuItem.menuSn == menuChild.upperMenuSn"
            >
              <q-list class="q-pl-md">
                <q-item clickable v-ripple :to="menuChild.link">
                  <q-item-section avatar>
                    <q-icon :name="'arrow_right'" />
                  </q-item-section>
                  <q-item-section>
                    {{ menuChild.title }}
                  </q-item-section>
                </q-item>
              </q-list>
            </q-slide-transition>
          </template>
        </template>
        <q-item
          clickable
          v-if="authStore.isLogin"
          exact
          @click="authStore.logout()"
        >
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section> Logout </q-item-section>
        </q-item>
        <q-item clickable v-else to="/login" exact>
          <q-item-section avatar>
            <q-icon name="login" />
          </q-item-section>
          <q-item-section> Login </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <slot />
    </q-page-container>
  </q-layout>
</template>

<style>
.q-slide-transition {
  transition: max-height 0.3s ease;
}
</style>

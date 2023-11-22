<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref } from 'vue';
import type { EssentialLinkProps } from '@/components/EssentialLink.vue';
import { type ApiResponse } from '../interface/server';
import { useAuthStore } from '../stores/useAuthStore' 

const router = useRouter();
const store = useAuthStore();
const { loading } = useQuasar()

// api로 조회할 데이터 구조
interface MenuData {
  menuId: string
  menuNm: string
  menuUrl: string
}

let essentialLinks = ref<EssentialLinkProps[]>([])

// const essentialLinks: EssentialLinkProps[] = [
  // {
  //   title: 'Docs',
  //   caption: 'quasar.dev',
  //   icon: 'school',
  //   link: 'https://quasar.dev'
  // },
  // {
  //   title: 'Github',
  //   caption: 'github.com/quasarframework',
  //   icon: 'code',
  //   link: 'https://github.com/quasarframework'
  // },
  // {
  //   title: 'Discord Chat Channel',
  //   caption: 'chat.quasar.dev',
  //   icon: 'chat',
  //   link: 'https://chat.quasar.dev'
  // },
  // {
  //   title: 'Forum',
  //   caption: 'forum.quasar.dev',
  //   icon: 'record_voice_over',
  //   link: 'https://forum.quasar.dev'
  // },
  // {
  //   title: 'Twitter',
  //   caption: '@quasarframework',
  //   icon: 'rss_feed',
  //   link: 'https://twitter.quasar.dev'
  // },
  // {
  //   title: 'Facebook',
  //   caption: '@QuasarFramework',
  //   icon: 'public',
  //   link: 'https://facebook.quasar.dev'
  // },
  // {
  //   title: 'Quasar Awesome',
  //   caption: 'Community Quasar projects',
  //   icon: 'favorite',
  //   link: 'https://awesome.quasar.dev',
  //   target: '_blank'
  // },
  // {
  //   title: 'pinia store 샘플',
  //   icon: 'favorite',
  //   link: '/counter',
  // },
  // {
  //   title: 'api 샘플',
  //   icon: 'favorite',
  //   link: '/api-test',
  // }
// ];

const defaultMenus = [
  {
    title: 'Docs',
    caption: 'quasar.dev',
    icon: 'school',
    link: 'https://quasar.dev'
  },
  {
    title: 'Github',
    caption: 'github.com/quasarframework',
    icon: 'code',
    link: 'https://github.com/quasarframework'
  },
  {
    title: 'Discord Chat Channel',
    caption: 'chat.quasar.dev',
    icon: 'chat',
    link: 'https://chat.quasar.dev'
  },
  {
    title: 'Forum',
    caption: 'forum.quasar.dev',
    icon: 'record_voice_over',
    link: 'https://forum.quasar.dev'
  },
  {
    title: 'Twitter',
    caption: '@quasarframework',
    icon: 'rss_feed',
    link: 'https://twitter.quasar.dev'
  },
  {
    title: 'Facebook',
    caption: '@QuasarFramework',
    icon: 'public',
    link: 'https://facebook.quasar.dev'
  },
  {
    title: 'Quasar Awesome',
    caption: 'Community Quasar projects',
    icon: 'favorite',
    link: 'https://awesome.quasar.dev',
    target: '_blank'
  }
]

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

const logout = () => {
  const access_token = localStorage.getItem('access_token')

  if(access_token) {
    const CLIENT_ID = '68ae4b196239138e24e76a6664659155'
      const LOGOUT_REDIRECT_URI = new URL(document.location.origin)      
      const kakaoURL = `https://kauth.kakao.com/oauth/logout?client_id=${CLIENT_ID}&logout_redirect_uri=${LOGOUT_REDIRECT_URI}`
      window.location.href = kakaoURL;
  }
}

onMounted(() => {
  selectMenu()
})
</script>
<template>
  <q-layout view="lHh Lpr lFf">
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

        <q-item-label header v-if="store.name" class="text-subtitle1">
          {{store.name}}님
        </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />

        <q-item v-if="store.token" clickable @click="logout" exact style="color: black;">
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>

          <q-item-section>
            Logout
          </q-item-section>
        </q-item>
        <q-item v-else to="/login" exact style="color: black;">
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

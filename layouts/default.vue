<script setup lang="ts">
import { ref } from 'vue';
import type { EssentialLinkProps } from '@/components/EssentialLink.vue';
import { type ApiResponse } from '../interface/server';

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
  const result = await $fetch<ApiResponse<MenuData>>("/playground/public/menu/select", {
            method: 'GET'
        })
        .catch((error) => {
          console.error('error: ', error)
          return
        })
  
  const resData = result?.data
  // essentialLinks.value = defaultMenus

  if (resData != undefined) {
    // const menu = Object.entries(resData)
    // const menu = Object.keys(resData)
    const menu = Object.values(resData)
    
    menu.forEach((item, idx) => {
      const menuItem: EssentialLinkProps = {
        title: item.menuNm,
        icon: iconList[idx],
        link: item.menuUrl
      }
      essentialLinks.value.push(menuItem)
    })
  }
  loading.hide()
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
        <q-item-label header>
          Essential Links
        </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <slot />
    </q-page-container>
  </q-layout>
</template>

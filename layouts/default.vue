<template>
  <div>
    <Head>
      <Title>{{ menuTitle }}</Title>
    </Head>
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

          <q-toolbar-title> {{ menuTitle }} </q-toolbar-title>

          <q-btn
            v-if="!isPWAInstalled"
            class="gt-xs"
            size="12px"
            flat
            dense
            round
            icon="download"
            @click="fn_installPWA"
          />
        </q-toolbar>
      </q-header>

      <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
        <q-list bordered>
          <q-item-label v-if="authStore.mberId" header>
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
            <template
              v-for="(menuChild, idx) in essentialLowerLinks"
              :key="idx"
            >
              <q-slide-transition
                v-show="menuItem.open"
                v-if="menuItem.menuSn == menuChild.upperMenuSn"
                class="slide-transition"
              >
                <q-list class="q-pl-md">
                  <q-item v-ripple clickable :to="menuChild.link">
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
          <div v-if="authStore.isLogin">
            <q-item clickable exact to="/my-page">
              <q-item-section avatar>
                <q-icon name="remove" />
              </q-item-section>
              <q-item-section> 내 정보 </q-item-section>
            </q-item>
            <q-item clickable exact @click="authStore.logout()">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section> Logout </q-item-section>
            </q-item>
          </div>

          <q-item v-else clickable to="/login" exact>
            <q-item-section avatar>
              <q-icon name="login" />
            </q-item-section>
            <q-item-section> Login </q-item-section>
          </q-item>
        </q-list>
      </q-drawer>

      <q-page-container>
        <div>
          <slot />
        </div>
      </q-page-container>
    </q-layout>
  </div>
</template>

<script setup lang="ts">
import Stomp from 'webstomp-client'
import SockJS from 'sockjs-client'
import { nextTick, onMounted, ref, watch } from 'vue'
import {
  useAsyncData,
  useNuxtApp,
  useRoute,
  useRuntimeConfig,
  useSeoMeta
} from 'nuxt/app'
import { LoadingBar, useQuasar } from 'quasar'
import type { ApiResponse, Metadata, PwaInjection } from '~/interface/server'
import { useAuthStore } from '~/stores/useAuthStore'
import type { EssentialLinkProps } from '@/components/EssentialLink.vue'

const config = useRuntimeConfig()
const nuxtApp = useNuxtApp()
const $pwa = nuxtApp.$pwa as PwaInjection
const authStore = useAuthStore()
const isPWAInstalled = ref<boolean>(false)

const $q = useQuasar()

// api로 조회할 데이터 구조
interface MenuData {
  menuSn: number
  menuNm: string
  menuUrl: string
  menuDepth: number
  menuSortOrdr: number
  upperMenuSn: number
  useAt: string
  lwprtMenuHoldAt: string
}

interface Data {
  mberId: string
}

const param = ref<Data>({
  mberId: authStore.mberId
})

const essentialLinks = ref<EssentialLinkProps[]>([])
const essentialLowerLinks = ref<EssentialLinkProps[]>([])

const iconList = ['']

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const setMenu = (arr: MenuData[]) => {
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
      menuItem.icon = 'remove'

      if (menuItem.lwprtMenuHoldAt == 'Y') {
        menuItem.link = ''
      }
      essentialLinks.value.push(menuItem)
    }
  })
}

const menuAsyncData = await useAsyncData(() =>
  $fetch<ApiResponse<MenuData[]>>('/playground/public/menu/select', {
    method: 'POST',
    body: JSON.stringify(param.value)
  })
)

const route = useRoute()
let currentMenu: MenuData | undefined = undefined

if (menuAsyncData.data.value?.data) {
  setMenu(menuAsyncData.data.value.data)

  currentMenu = menuAsyncData.data.value.data.find(
    (item) => item.menuUrl == route.path
  )
} else {
  console.error('error: ', menuAsyncData.error)
  throw new Error('메뉴를 불러오지 못했습니다.')
}

const menuTitle = ref<string>('Playground')

if (currentMenu) {
  menuTitle.value = currentMenu.menuNm
}

const fn_setSeoMenuExtends = async () => {
  if (menuAsyncData.data.value?.data) {
    currentMenu = menuAsyncData.data.value.data.find(
      (item) => item.menuUrl == route.path
    )

    if (currentMenu) {
      menuTitle.value = currentMenu.menuNm
    }
  }

  const metaAsyncData = await useAsyncData(() =>
    $fetch<ApiResponse<Metadata>>('/playground/public/metadata', {
      method: 'GET',
      params: {
        url: route.path
      }
    })
  )

  if (metaAsyncData.data.value?.data) {
    // metadataSet
    const meta: Metadata = metaAsyncData.data.value.data
    useSeoMeta({
      title: () => meta.title ?? 'Playground',
      ogTitle: () => meta.ogTitle ?? '',
      description: () => meta.description ?? '',
      ogDescription: () => meta.ogDescription ?? '',
      ogImage: () => meta.ogImages[0] ?? ''
    })
  }
}

await fn_setSeoMenuExtends()

watch(
  () => route.path,
  () => {
    fn_setSeoMenuExtends()
  }
)

const toggleMenu = (menuItem: EssentialLinkProps) => {
  menuItem.open = !menuItem.open
}

LoadingBar.setDefaults({
  hijackFilter(url) {
    return /\/playground\/(?:api|public)\//.test(url)
  }
})

const fn_installPWA = async () => {
  await nextTick()

  if ($pwa) {
    if ($pwa.needRefresh) {
      await $pwa.updateServiceWorker()
    }

    await $pwa.install()

    if ($pwa.needRefresh) {
      await $pwa.updateServiceWorker()
    }
  }
}

onMounted(() => {
  if ($pwa.isPWAInstalled) {
    isPWAInstalled.value = true
  }

  const serverURL = `${config.public.apiBaseUrl}/ws`

  const socket = new SockJS(serverURL)
  const stompClient = Stomp.over(socket, { debug: false })

  stompClient.connect(
    {},
    (frame) => {
      console.debug('websocket connected', frame)

      stompClient.subscribe('/sub', (response) => {
        const body = JSON.parse(response.body)
        const caption = new Intl.DateTimeFormat('ko', {
          timeStyle: 'medium'
        }).format(new Date(body.sendDate))

        // TODO Notification권한 체크해서 notification가능하면 push 아니면 notify
        $q.notify({
          message: body.message,
          caption,
          position: 'top',
          icon: 'announcement',
          color: 'teal',
          progress: true,
          html: body.messageType == 'HTML'
        })
      })
    },
    (error) => {
      console.debug('websocket connect fail', error)
    }
  )
})
</script>

<style lang="scss" scoped>
.slide-transition {
  transition: max-height 0.3s ease;
}
</style>

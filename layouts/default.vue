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
import { nextTick, onMounted, ref, watch } from 'vue'
import {
  navigateTo,
  useAsyncData,
  useNuxtApp,
  useRoute,
  useRuntimeConfig,
  useSeoMeta
} from 'nuxt/app'
import type { QNotifyCreateOptions } from 'quasar'
import { LoadingBar, useQuasar } from 'quasar'
import Stomp from 'webstomp-client'
import SockJS from 'sockjs-client'
import type { ApiResponse, Metadata, PwaInjection } from '~/interface/server'
import { useAuthStore } from '~/stores/useAuthStore'
import type { EssentialLinkProps } from '@/components/EssentialLink.vue'

const nuxtApp = useNuxtApp()
const config = useRuntimeConfig()
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

interface RecvMessage {
  message: string
  messageType: string
  sendDate: string
  senderId: string
  etc: { [key: string]: string }
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
    (item: MenuData) => item.menuUrl == route.path
  )
} else {
  console.error('error: ', menuAsyncData)
  console.error('error.value: ', menuAsyncData.error.value)
  throw new Error('메뉴를 불러오지 못했습니다.')
}

const menuTitle = ref<string>('Playground')

if (currentMenu) {
  menuTitle.value = currentMenu.menuNm
}

const fn_setSeoMenuExtends = async () => {
  if (menuAsyncData.data.value?.data) {
    currentMenu = menuAsyncData.data.value.data.find(
      (item: MenuData) => item.menuUrl == route.path
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

    if (!currentMenu) {
      menuTitle.value = meta.title
    }
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
        const body = JSON.parse(response.body) as RecvMessage

        fn_notification(body)
      })
    },
    (error) => {
      console.debug('websocket connect fail', error)
    }
  )
})

const fn_notification = (body: RecvMessage) => {
  const isHtml = body.messageType == 'HTML'
  const htmlCheckRegex: RegExp = /(<([^>]+)>)/g

  const hasHref: boolean = body.etc?.href?.length > 0

  let messageWithoutHtmlTag = body.message

  if (isHtml || htmlCheckRegex.test(body.message)) {
    messageWithoutHtmlTag = body.message
      .replaceAll(/(<(br|p)\/?>)/g, ' ')
      .replaceAll(htmlCheckRegex, '')
  }

  const caption = new Intl.DateTimeFormat('ko', {
    timeStyle: 'medium'
  }).format(new Date(body.sendDate))

  const notifyOptions: QNotifyCreateOptions = {
    message: body.message,
    caption,
    position: 'top',
    icon: 'announcement',
    color: 'teal',
    progress: true,
    group: body.message + '|' + new Date().getTime(),
    html: isHtml
  }

  if (hasHref) {
    const label = body.etc.hrefBtnName || '이동'

    notifyOptions.actions = [
      {
        label,
        color: 'white',
        handler: () => {
          navigateTo(body.etc.href, {
            external: body.etc.href.includes('http')
          })
        },
        'aria-label': label
      }
    ]
  }

  $q.notify(notifyOptions)

  if (window.Notification) {
    if (Notification.permission === 'granted') {
      const notification = new Notification(messageWithoutHtmlTag)

      if (hasHref) {
        notification.onclick = (e) => {
          e.preventDefault()

          window.focus()

          navigateTo(body.etc.href, {
            external: body.etc.href.includes('http')
          })
        }
      }

      setTimeout(() => {
        notification.close()
      }, 3000)
    } else if (Notification.permission === 'denied') {
      $q.notify({
        message:
          '브라우저 알림이 차단되어있습니다.\n브라우저의 사이트 설정에서 변경하실 수 있습니다.',
        position: 'bottom-right',
        icon: 'announcement',
        color: 'teal'
      })
    } else {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          const notification = new Notification(messageWithoutHtmlTag)

          if (hasHref) {
            notification.onclick = (e) => {
              e.preventDefault()

              window.focus()

              navigateTo(body.etc.href, {
                external: body.etc.href.includes('http')
              })
            }
          }

          setTimeout(() => {
            notification.close()
          }, 3000)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.slide-transition {
  transition: max-height 0.3s ease;
}
</style>

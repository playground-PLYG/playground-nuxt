<template>
  <div class="content">
    <div class="title">
      <div class="text-h4"><q-icon name="person" size="1.2em" /> 내 정보</div>
    </div>
    <div
      class="profile q-card shadow_custom q-py-sm q-pa-none q-ma-none search"
    >
      <div class="q-card__section q-card__section--vert q-pa-none">
        <div
          class="q-card__section q-card__section--vert text-subtitle1 color q-pt-none"
        >
          <div
            class="q-card__section q-card__section--vert q-pa-none text-grey-8"
          >
            <div class="q-list q-list--dense q-list--padding">
              <div
                class="q-item__label q-item__label--header q-mt-md text-grey-6"
              >
                ROLE
              </div>
              <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                <div
                  v-for="(auth, authorIndex) in authorList"
                  :key="authorIndex"
                  class="q-item q-item-type row no-wrap"
                  role="listitem"
                >
                  <div
                    class="q-item__section column q-item__section--side justify-center q-pr-sm"
                  >
                    <div
                      class="q-avatar rounded-borders"
                      style="
                        font-size: 40px;
                        background-color: rgb(234, 232, 253) !important;
                      "
                    >
                      <div
                        class="q-avatar__content row flex-center overflow-hidden"
                      >
                        <span class="material-icons"> portrait </span>
                      </div>
                    </div>
                  </div>
                  <div
                    class="q-item__section column q-item__section--main justify-center text-left"
                  >
                    <div class="q-item__label text-subtitle1 color text-grey-8">
                      {{ auth.authorNm }}
                    </div>
                    <div class="q-item__label text-caption text-grey-8">
                      {{ auth.authorId }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            class="q-card__section q-card__section--vert q-pa-none text-grey-8"
          >
            <div class="q-list q-list--dense q-list--padding">
              <div
                class="q-item__label q-item__label--header q-mt-md text-grey-6"
              >
                DETAILS
              </div>
              <div class="q-item q-item-type row no-wrap" role="listitem">
                <div
                  class="q-item__section column q-item__section--side justify-center"
                >
                  <span class="text-grey-8 text-subtitle1">
                    아이디:
                    <span class="text-grey-6">{{ user?.mberId }}</span></span
                  >
                </div>
              </div>
              <div class="q-item q-item-type row no-wrap" role="listitem">
                <div
                  class="q-item__section column q-item__section--side justify-center"
                >
                  <span class="text-grey-8 text-subtitle1">
                    이름:
                    <span class="text-grey-6">{{ user?.mberNm }}</span></span
                  >
                </div>
              </div>
              <div class="q-item q-item-type row no-wrap" role="listitem">
                <div
                  class="q-item__section column q-item__section--side justify-center"
                >
                  <span class="text-grey-8 text-subtitle1">
                    이메일:
                    <span class="text-grey-6">{{
                      user?.mberEmailAdres
                    }}</span></span
                  >
                </div>
              </div>
              <div class="q-item q-item-type row no-wrap" role="listitem">
                <div
                  class="q-item__section column q-item__section--side justify-center"
                >
                  <span class="text-grey-8 text-subtitle1">
                    전화번호:
                    <span class="text-grey-6">{{ user?.mberTelno }}</span></span
                  >
                </div>
              </div>
              <div class="q-item q-item-type row no-wrap" role="listitem">
                <div
                  class="q-item__section column q-item__section--side justify-center"
                >
                  <span class="text-grey-8 text-subtitle1">
                    성별:
                    <span class="text-grey-6">{{
                      user?.mberGender
                    }}</span></span
                  >
                </div>
              </div>
              <div class="q-item q-item-type row no-wrap" role="listitem">
                <div
                  class="q-item__section column q-item__section--side justify-center"
                >
                  <span class="text-grey-8 text-subtitle1">
                    생년월일:
                    <span class="text-grey-6">{{ user?.mberBymd }}</span></span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="proc">
      <q-btn
        class="buttonR"
        color="primary"
        type="button"
        label="수정"
        @click="openEditPopup"
      />
    </div>

    <div class="popup">
      <q-dialog ref="codeForm" v-model="isShowEditPopup" @hide="onReset">
        <q-layout container>
          <q-header>
            <q-toolbar class="bg-primary">
              <q-toolbar-title> title </q-toolbar-title>
              <q-btn v-close-popup flat round dense icon="close" />
            </q-toolbar>
          </q-header>
          <q-page-container class="bg-white">
            <q-card>
              <q-card-section>
                <q-form @submit="onSubmit">
                  <q-card-section class="q-pt-none">
                    <q-input
                      v-model="modifyInfo.mberNm"
                      label="이름"
                      class="input"
                      outlined
                      :rules="[nameRules]"
                    />
                    <q-input
                      v-model="modifyInfo.mberBymd"
                      label="생년월일"
                      outlined
                      :rules="[brdtRules]"
                    />
                    <q-btn-toggle
                      v-model="modifyInfo.mberSexdstnCode"
                      class="input"
                      :options="[
                        { label: '남자', value: 'M' },
                        { label: '여자', value: 'F' }
                      ]"
                      padding="11px"
                      style="margin-bottom: 20px"
                    />
                    <q-input
                      v-model="modifyInfo.mberTelno"
                      label="전화번호"
                      outlined
                      :rules="[telNoRules]"
                    />
                    <q-toolbar class="bg-white">
                      <q-toolbar-title />
                      <div class="proc">
                        <q-btn
                          push
                          class="q-mr-sm, buttonR"
                          color="primary"
                          label="저장"
                          type="submit"
                        />
                        <q-btn
                          push
                          class="buttonR"
                          color="negative"
                          label="취소"
                          @click="cancel"
                        />
                      </div>
                    </q-toolbar>
                  </q-card-section>
                </q-form>
              </q-card-section>
            </q-card>
          </q-page-container>
        </q-layout>
      </q-dialog>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { type ApiResponse } from '../../interface/server'
import { useAuthStore } from '../../stores/useAuthStore'

const { loading } = useQuasar()
const authStore = useAuthStore()

/** 유저정보 */
interface User {
  mberId: string
  mberNm: string
  mberEmailAdres: string
  mberBymd: string
  mberSexdstnCode: string
  mberGender: string
  mberTelno: string
  authorNm: string
  authorId: string
}

/** 변경정보 */
interface ModifyInfo {
  mberId: string
  mberNm: string
  mberBymd: string
  mberSexdstnCode: string
  mberTelno: string
}

/** 권한 */
interface author {
  authorNm: string
  authorId: string
}

const authorList = ref<author[]>([])
const user = ref<User>()
const modifyInfo = ref<ModifyInfo>({
  mberId: '',
  mberNm: '',
  mberBymd: '',
  mberSexdstnCode: '',
  mberTelno: ''
})
const isShowEditPopup = ref<boolean>(false)

onMounted(() => {
  getMyInfo()
})

const getMyInfo = async () => {
  loading.show()
  await $fetch<ApiResponse<User>>('/playground/api/member/getMyInfo', {
    method: 'GET'
  })
    .then((res) => {
      user.value = res.data
      if (user.value.authorId || user.value.authorNm) {
        const authorIds = user.value.authorId
          .split(',')
          .map((item) => item.trim())
        const authorNms = user.value.authorNm
          .split(',')
          .map((item) => item.trim())

        authorList.value = authorIds.map((authorId, index) => ({
          authorId,
          authorNm: authorNms[index]
        }))
      } else {
        authorList.value = [{ authorId: 'ROLE_USER', authorNm: '일반 사용자' }]
      }
      user.value.mberGender = res.data.mberSexdstnCode == 'F' ? '여자' : '남자'
    })
    .catch((err) => {
      console.error(err)
      authStore.logout()
    })
  loading.hide()
}

const onSubmit = async () => {
  loading.show()
  await $fetch<ApiResponse<User[]>>('/playground/api/member/modifyMberinfo', {
    method: 'POST',
    body: JSON.stringify(modifyInfo.value)
  })
    .then(() => {
      onReset()
      getMyInfo()
    })
    .catch((error) => {
      console.error(error)
    })
  loading.hide()
}
const openEditPopup = () => {
  isShowEditPopup.value = true
  if (user.value) {
    modifyInfo.value = {
      mberId: user.value.mberId,
      mberNm: user.value.mberNm,
      mberBymd: user.value.mberBymd,
      mberSexdstnCode: user.value.mberSexdstnCode,
      mberTelno: user.value.mberTelno
    }
  }
}

const cancel = () => {
  onReset()
}

const onReset = () => {
  isShowEditPopup.value = false
  modifyInfo.value = {
    mberId: '',
    mberNm: '',
    mberBymd: '',
    mberSexdstnCode: '',
    mberTelno: ''
  }
}

const nameRules = (val: string) => {
  if (!val) {
    return '이름을 입력해주세요.'
  }
  if (checkSpecial(val)) {
    return '특수문자는 입력할 수 없습니다.'
  }
  if (val.length < 2) {
    return '이름은 2자 이상이어야 합니다.'
  }
  return true
}

const telNoRules = (val: string) => {
  if (!val) {
    return '전화번호를 입력해주세요.'
  }
  if (checkSpecial(val)) {
    return '특수문자는 입력할 수 없습니다.'
  }
  if (checkNumber(val)) {
    return '숫자만 입력할 수 있습니다.'
  }
  if (val.length < 10) {
    return '전화전호는 10자 이상이어야 합니다.'
  }
  return true
}

const brdtRules = (val: string) => {
  if (!val) {
    return '생년월일을 입력해주세요.'
  }
  if (checkSpecial(val)) {
    return '특수문자는 입력할 수 없습니다.'
  }
  if (checkNumber(val)) {
    return '숫자만 입력할 수 있습니다.'
  }
  if (val.length < 8) {
    return '생년월일은 8자 이상이어야 합니다.'
  }
  return true
}

const checkSpecial = (val: string) => {
  return val.match(/[{}[\]/?.,;:|)*~`!^\-_+<>@#$%&\\=('"]/g)
}

const checkNumber = (val: string) => {
  return !val.match(/\d/g)
}
</script>
<style lang="scss" scoped>
.content {
  margin-top: 2rem;
  margin-left: 5rem;
  margin-right: 5rem;

  .title {
    margin-top: 2rem;
  }

  .search {
    margin-top: 2rem;

    .input {
      display: inline-block;
      vertical-align: middle;
      width: 15%;
      padding-right: 0.5rem;
    }
    .select {
      display: inline-block;
      vertical-align: middle;
      width: 15%;
      padding-right: 0.5rem;
    }
    .button {
      margin-right: 0.5rem;
    }
  }

  .table {
    margin-top: 1rem;
  }

  .proc {
    margin-top: 1rem;

    .button {
      margin-right: 0.5rem;
    }
    .buttonR {
      margin-left: 0.5rem;
      float: right;
    }
  }

  .items-center {
    justify-content: center;
    height: 5rem;

    .flex-center {
      padding: 0;
    }
  }
}
</style>

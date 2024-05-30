<template>
  <div class="content">
    <div class="title">
      <div class="text-h4"><q-icon name="record_voice_over" /> 회원관리</div>
    </div>
    <div class="search">
      <div class="q-gutter-md row items-start">
        <q-input
          outlined
          v-model="searchParam.mberId"
          label="회원아이디"
          round
          dense
          flat
          class="input"
        />
        <q-input
          outlined
          v-model="searchParam.mberNm"
          label="회원명"
          round
          dense
          flat
          class="input"
        />
        <q-btn
          push
          color="green-7"
          class="button"
          label="조회"
          @click="memberSearch"
          value="memberSearch"
        ></q-btn>
        <q-btn
          push
          color="green-7"
          class="button"
          label="초기화"
          @click="reset"
        />
      </div>
    </div>
    <div class="table">
      <q-table
        flat
        bordered
        :rows="resData"
        row-key="mberId"
        :columns="columns"
        class="my-sticky-header-table"
        v-model:selected="selected"
        selection="single"
        :rows-per-page-options="[0]"
      >
      </q-table>
    </div>
    <div class="proc">
      <q-btn
        push
        class="button"
        color="primary"
        label="회원권한등록"
        @click="clickMberAuthorAdd"
      />
    </div>
  </div>

  <div class="popup">
    <q-dialog v-model="showAuthorMapngDialog">
      <q-layout container style="width: 800px; max-width: 100vw">
        <q-header>
          <q-toolbar class="bg-primary">
            <q-toolbar-title>회원권한매핑</q-toolbar-title>
            <q-btn flat v-close-popup round dense icon="close" />
          </q-toolbar>
        </q-header>
        <q-page-container class="bg-white">
          <q-card>
            <q-card-section>
              <q-input
                v-model="AuthorParam.mberId"
                label="회원아이디"
                class="input"
                outlined
                :readonly="true"
              />
              <q-table
                :rows="resAuthorData"
                row-key="authorId"
                :columns="AuthorColumns"
                v-model:selected="authorSelected"
                selection="single"
                :rows-per-page-options="[0]"
                @selection="clickAuthorRow"
              />
            </q-card-section>
            <q-toolbar class="bg-white">
              <q-toolbar-title></q-toolbar-title>
              <div class="q-gutter-md row items-start">
                <q-btn
                  push
                  color="primary"
                  label="등록"
                  type="submit"
                  @click="addAuthorMapng"
                />
                <q-btn
                  push
                  color="primary"
                  label="삭제"
                  type="submit"
                  @click="removeAuthorMapng"
                />
              </div>
            </q-toolbar>
          </q-card>
        </q-page-container>
      </q-layout>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { date, type QTableProps } from 'quasar'
import { type ApiResponse } from '../../interface/server'

const router = useRouter()
const { loading } = useQuasar()

const columns = ref<QTableProps['columns']>([
  {
    name: 'index',
    label: '순번',
    field: 'index',
    align: 'center'
  },
  {
    name: 'mberId',
    align: 'center',
    label: '회원아이디',
    field: 'mberId',
    sortable: false
  },
  {
    name: 'mberNm',
    align: 'center',
    label: '회원명',
    field: 'mberNm',
    sortable: false
  },
  {
    name: 'mberBymd',
    align: 'center',
    label: '회원생년월일',
    field: 'mberBymd'
  },
  {
    name: 'mberSexdstnCode',
    align: 'center',
    label: '회원성별',
    field: 'mberSexdstnCode',
    format: (val: string) => (val == 'M' ? '남' : '여')
  },
  {
    name: 'mberEmailAdres',
    align: 'center',
    label: '회원이메일주소',
    field: 'mberEmailAdres'
  },
  {
    name: 'mberTelno',
    align: 'center',
    label: '회원전화번호',
    field: 'mberTelno'
  },
  { name: 'registUsrId', label: '등록자', field: 'registUsrId', align: 'left' },
  { name: 'registDt', label: '등록일시', field: 'registDt', align: 'left' },
  { name: 'updtUsrId', label: '수정자', field: 'updtUsrId', align: 'left' },
  { name: 'updtDt', label: '수정일시', field: 'updtDt', align: 'left' }
])

const AuthorColumns = ref<QTableProps['columns']>([
  {
    name: 'authorId',
    align: 'center',
    label: '권한ID',
    field: 'authorId',
    sortable: false
  },
  {
    name: 'authorNm',
    align: 'center',
    label: '권한명',
    field: 'authorNm',
    sortable: false
  },
  {
    name: 'mberAuthorAddAt',
    align: 'center',
    label: '권한등록여부',
    field: 'mberAuthorAddAt',
    sortable: false
  }
])

// api로 조회할 검색 조건 데이터 구조
interface Search {
  mberId?: string
  mberNm: string
}

// api로 조회할 데이터 구조
interface Data {
  index: any
  mberId: string
  mberNm: string
  mberBymd: string
  mberSexdstnCode: string
  mberEmailAdres: string
  MberTelno: string
  registUsrId: string
  registDt: string
  updtUsrId: string
  updtDt: string
}

interface AuthorData {
  mberId?: string
  authorId?: string
  authorNm: string
  mberAuthorAddAt: string
}

interface AuthorData {
  mberId?: string
  authorId?: string
  authorNm: string
  mberAuthorAddAt: string
}

const param = ref<Search>({
  mberId: '',
  mberNm: ''
})

let searchParam = ref<Search>({
  mberId: '',
  mberNm: ''
})

let AuthorParam = ref<AuthorData>({
  mberId: '',
  authorId: '',
  authorNm: '',
  mberAuthorAddAt: ''
})

let resData = ref<Data[]>([])
let resAuthorData = ref<AuthorData[]>([])

let selected = ref<Data[]>()
let authorSelected = ref<AuthorData>()

let showAuthorMapngDialog = ref<boolean>(false)
let authorClickYn = 'N'

const reset = () => {
  param.value = {
    mberId: '',
    mberNm: ''
  }
  memberSearch()
}

const memberSearch = async () => {
  loading.show()
  const result = await $fetch<ApiResponse<Data[]>>(
    '/playground/public/member/getMberList',
    {
      method: 'POST',
      body: JSON.stringify(searchParam.value)
    }
  )
  resData.value = result.data

  // for (let i = 0; i < result.data.length; i++) {
  //     resData.value = result.data.slice(0).map(r => ({ ...r }))
  // }
  resData.value.forEach((row, index) => {
    row.index = index + 1
  })
  loading.hide()
}

const clickMberAuthorAdd = async () => {
  if (typeof selected.value === 'undefined') {
    alert('권한 등록할 회원을 선택해주시기 바랍니다.')
    return
  }

  AuthorParam.value.mberId = selected.value[0].mberId

  loading.show()
  await $fetch<ApiResponse<AuthorData[]>>(
    '/playground/public/author/getMberAuthorList',
    {
      method: 'POST',
      body: JSON.stringify(AuthorParam.value)
    }
  )
    .then((result) => {
      resAuthorData.value = result.data
      showAuthorMapngDialog.value = true
    })
    .catch((error) => {
      console.error(error)
    })
  loading.hide()
}

const clickAuthorRow = async (details: any) => {
  if (details.added == true) {
    AuthorParam.value = details.rows[0]
    authorClickYn = 'Y'
  } else {
    authorClickYn = 'N'
  }
}

const addAuthorMapng = async () => {
  if (authorClickYn === 'N') {
    alert('등록할 권한을 선택해 주세요.')
    return
  }

  if (AuthorParam.value?.mberAuthorAddAt == 'Y') {
    alert('권한 중복 매핑은 불가합니다.')
    return
  }
  loading.show()
  await $fetch<ApiResponse<AuthorData[]>>(
    '/playground/public/author/addMberAuthor',
    {
      method: 'POST',
      body: JSON.stringify(AuthorParam.value)
    }
  )
    .then(() => {
      alert(AuthorParam.value.mberId + ' 회원의 권한이 등록되었습니다.')
      router.go(0)
    })
    .catch((error) => {
      console.error(error)
      alert(AuthorParam.value.mberId + ' 회원의 권한이 등록되지 않았습니다.')
    })
  loading.hide()
}

const removeAuthorMapng = async () => {
  if (authorClickYn === 'N') {
    alert('삭제할 권한을 선택해주시기 바랍니다.')
    return
  }

  if (authorSelected.value?.mberAuthorAddAt == 'N') {
    alert('매핑되지 않은 권한은 삭제 불가합니다.')
    return
  }
  loading.show()
  await $fetch<ApiResponse<AuthorData[]>>(
    '/playground/public/author/removeMberAuthor',
    {
      method: 'POST',
      body: JSON.stringify(authorSelected.value)
    }
  )
    .then(() => {
      alert(AuthorParam.value.mberId + ' 회원의 권한이 삭제되었습니다.')
      router.go(0)
    })
    .catch((error) => {
      console.error(error)
      alert(AuthorParam.value.mberId + ' 회원의 권한이 삭제되지 않았습니다.')
    })
  loading.hide()
}

onMounted(() => {
  memberSearch()
})
</script>
<style>
.content {
  margin-top: 3rem;
  margin-left: 5rem;
  margin-right: 5rem;
}

.title {
  margin-top: 3rem;
}

.search {
  margin-top: 2rem;
}

.search .select {
  display: inline-block;
  vertical-align: middle;
  width: 15%;
  padding-right: 0.5rem;
}

.search .input {
  display: inline-block;
  vertical-align: middle;
  width: 15%;
  padding-right: 0.5rem;
}

.search .button {
  margin-right: 0.5rem;
}

.table {
  margin-top: 1rem;
}

.proc {
  margin-top: 1rem;
}

.proc .button {
  margin-right: 0.5rem;
}

.proc .buttonR {
  margin-left: 0.5rem;
  float: right;
}
</style>

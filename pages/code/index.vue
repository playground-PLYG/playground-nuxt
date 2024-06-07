<template>
  <div class="q-pa-md">
    <div class="q-gutter-md row items-start">
      <q-input
        v-model="param.codeId"
        outlined
        label="코드ID"
        round
        dense
        flat
      />
      <q-input
        v-model="param.codeNm"
        outlined
        label="코드명"
        round
        dense
        flat
      />
      <q-input
        v-model="param.upperCodeId"
        outlined
        label="상위코드명"
        round
        dense
        flat
      />
      <!-- <q-select filled round dense flat v-model="param.upCdId" :options="arr" stack-label label="상위코드ID"
                :display-value="`${param.upCdId ? param.upCdId : '코드선택'}`" style="width: 200px">
                <template v-slot:append>
                    <q-icon v-if="param.upCdId !== null" class="cursor-pointer" name="clear"
                        @click.stop.prevent="param.upCdId = ''" />
                </template>
            </q-select> -->

      <q-select
        v-model="param.groupCodeAt"
        outlined
        :options="groupCdOptions"
        label="그룹코드여부"
        style="width: 200px"
        round
        dense
        flat
      >
        <template v-if="param.groupCodeAt" #append>
          <q-icon
            name="clear"
            class="cursor-pointer"
            @click.stop.prevent="param.groupCodeAt = ''"
          />
        </template>
      </q-select>
      <q-btn
        color="primary"
        label="조회"
        value="codeSearch"
        @click="codeSearch"
      />
    </div>
  </div>

  <div class="q-pa-md">
    <!-- <q-table title="코드관리" :rows="resData" :columns="columns" @row-click="clickRow"> -->

    <q-table
      v-model:selected="selected"
      flat
      bordered
      title="코드관리"
      :rows="resData"
      row-key="codeSn"
      :columns="columns"
      class="my-sticky-header-table"
      selection="single"
    >
      <template #top-right>
        <q-btn color="primary" label="등록/수정" @click="insert" />
        &ensp;
        <q-btn color="primary" label="삭제" type="reset" @click="codeDelete" />
      </template>
    </q-table>
  </div>

  <template>
    <div class="q-pa-md q-gutter-sm">
      <q-dialog v-model="prompt" persistent>
        <q-card style="min-width: 350px">
          <q-form class="q-gutter-md" @submit="insertCode">
            <q-card-section>
              <div class="text-h6">코드 등록/수정</div>
            </q-card-section>
            <div />
            <q-card-section class="q-pt-none">
              <q-input
                v-model="insertParam.codeId"
                dense
                autofocus
                label="코드ID"
                filled
                :rules="[codeid_rules]"
                :readonly="readonly"
              />
              <q-input
                v-model="insertParam.codeNm"
                dense
                autofocus
                label="코드명"
                filled
                :rules="[codeNm_rules]"
              />
              <q-checkbox
                v-model="groupCdCheck"
                left-label
                label="상위코드 선택"
              />
              <q-select
                v-if="groupCdCheck"
                v-model="insertParam.upperCodeId"
                filled
                :options="arr"
                hint="상위코드를 선택하세요"
              />
              <q-input
                v-model="insertParam.sortOrdr"
                dense
                type="number"
                autofocus
                label="정렬순번"
                filled
                :rules="[sortSn_rules]"
              />
            </q-card-section>
            <q-card-actions align="right" class="text-primary">
              <q-btn
                v-close-popup
                flat
                label="닫기"
                type="reset"
                @click="codeReset"
              />
              <q-btn flat label="등록" type="submit" />
            </q-card-actions>
          </q-form>
        </q-card>
      </q-dialog>
    </div>
  </template>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { type QTableProps, date } from 'quasar'
import { type ApiResponse } from '../../interface/server'

const columns = ref<QTableProps['columns']>([
  {
    name: 'codeId',
    align: 'left',
    label: '코드ID',
    field: 'codeId',
    sortable: true
  },
  { name: 'codeNm', align: 'center', label: '코드명', field: 'codeNm' },
  {
    name: 'upperCodeId',
    align: 'center',
    label: '상위코드ID',
    field: 'upperCodeId',
    sortable: true
  },
  {
    name: 'groupCodeAt',
    align: 'center',
    label: '그룹코드사용여부',
    field: 'groupCodeAt'
  },
  {
    name: 'sortOrdr',
    align: 'center',
    label: '정렬순번',
    field: 'sortOrdr',
    sortable: true
  },
  {
    name: 'registUsrId',
    align: 'center',
    label: '등록자',
    field: 'registUsrId'
  },
  { name: 'registDt', align: 'center', label: '등록일시', field: 'registDt' },
  { name: 'updtUsrId', align: 'center', label: '수정자', field: 'updtUsrId' },
  { name: 'updtDt', align: 'center', label: '수정일시', field: 'updtDt' }
])

//let insertForm = ref<any>(null);
const prompt = ref(false)
const resData = ref<Data[]>([])
const searchData = ref<Data[]>()
let selected = ref<Data[]>()
let groupCdCheck = ref(false)
let arr = []
const readonly = ref(false)

// const clickRow = (evt: any, row: any, index: any) => {
//     updateParam.value = { ...row }
//     console.log("###", updateParam.value)
//     insert()
// }

//그룹코드여부
const groupCdOptions = ['Y', 'N']

// api로 조회할 검색 조건 데이터 구조
interface Search {
  codeId: string
  codeNm: string
  upperCodeId: string
  groupCodeAt: string
  sortOrdr?: number
  registUsrId: string
  updtUsrId: string
}

// api로 조회할 데이터 구조
interface Data {
  codesn: string
  codeId: string
  codeNm: string
  upperCodeId: string
  groupCodeAt: string
  sortOrdr?: number
  registUsrId: string
  updtUsrId: string
  registDt: string
  updtDt: string
}

const param = ref<Search>({
  codeId: '',
  codeNm: '',
  upperCodeId: '',
  groupCodeAt: '',
  registUsrId: '',
  updtUsrId: ''
})

const deleteData = ref<Search>({
  codeId: '',
  codeNm: '',
  upperCodeId: '',
  groupCodeAt: '',
  registUsrId: '',
  updtUsrId: ''
})

const insertParam = ref<Search>({
  codeId: '',
  codeNm: '',
  upperCodeId: '',
  groupCodeAt: '',
  registUsrId: '',
  updtUsrId: ''
})

const updateParam = ref<Search>({
  codeId: '',
  codeNm: '',
  upperCodeId: '',
  groupCodeAt: '',
  registUsrId: '',
  updtUsrId: ''
})

const codeid_rules = (val: string) => {
  if (!val) {
    return '코드ID를 입력해주세요.'
  }
  const kor = val.match(/[ㄱ-ㅎ|ㅏ-ㅣ가-힣]/g)
  if (kor) {
    return '한글은 입력할 수 없습니다.'
  }
  const special = val.match(/[{}[\]/?.,;:|)*~`!^\-+<>@#$%&\\=('"]/g)
  if (special) {
    return '특수문자는 입력할 수 없습니다.'
  }
  return true
}

const codeNm_rules = (val: string) => {
  if (!val) {
    return '코드명을 입력해주세요.'
  }
  const special = val.match(/[{}[\]/?,;:|)*~`!^\-+<>@#$%&\\=('"]/g)
  if (special) {
    return '특수문자는 입력할 수 없습니다.'
  }
  return true
}

const sortSn_rules = (val: string) => {
  if (!val) {
    return '정렬순번을 입력해주세요. 숫자만 입력 가능 합니다.'
  }
  return true
}

//코드 조회
const codeSearch = async () => {
  const result = await $fetch<ApiResponse<Data[]>>(
    '/playground/public/code/codeSearch',
    {
      method: 'POST',
      body: JSON.stringify(param.value)
    }
  )
  resData.value = result.data
}

//상위 코드 조회
const SearchAll = async () => {
  const result = await $fetch<ApiResponse<Data[]>>(
    '/playground/public/code/selectUpCodeid',
    {
      method: 'GET'
    }
  )
  searchData.value = result.data

  console.log(':::::::::::searchData', searchData)

  arr.length = 0

  searchData.value.forEach((item) => {
    if (item.groupCodeAt == 'Y') {
      const upcodeid = item.codeNm
      arr.push(upcodeid)
    }
  })

  //중복 제거
  const set = new Set(arr)
  const uniqueArr = [...set]
  //정렬
  arr = uniqueArr.sort()
}

//코드 삭제
const codeDelete = async () => {
  let codeId = ''

  selected.value?.forEach(async (item) => {
    deleteData.value = { ...item }
  })
  codeId = deleteData.value.codeId

  if (codeId == '' || codeId == null || codeId == undefined) {
    alert('삭제할 코드를 선택하세요.')
  } else if (
    !confirm('코드ID : ' + codeId + '  해당 코드를 삭제하시겠습니까?')
  ) {
  } else {
    const result = await $fetch<ApiResponse<Data[]>>(
      '/playground/public/code/codeDelete',
      {
        method: 'POST',
        body: JSON.stringify(deleteData.value)
      }
    )
    alert('삭제되었습니다.')
    codeReset()
  }
}

const insert = async () => {
  prompt.value = true

  let findSn = ''

  //객체 복사 , update시 코드,상위코드 readonly(sn 값이 있으면)
  if (selected.value !== null) {
    selected.value?.forEach((item) => {
      updateParam.value = { ...item }
      findSn = item.codesn
    })
    if (findSn !== '') {
      readonly.value = true
      insertParam.value = updateParam.value

      //상위코드값이 저장되어 있으면 코드 값 보이게
      if (updateParam.value.upperCodeId !== '') {
        groupCdCheck.value = true
      } else {
        groupCdCheck.value = false
      }
    } else {
      readonly.value = false
    }
  }

  // if (updateParam.value.cdId !== '') {
  //     readonly.value = true

  //     insertParam.value = updateParam.value

  //     //상위코드값이 저장되어 있으면 코드 값 보이게
  //     if (updateParam.value.upCdId !== '') {
  //         groupCdCheck.value = true
  //     }
  //     else { groupCdCheck.value = false }
  // } else {
  //     readonly.value = false
  // }
}

//코드 등록
const insertCode = async () => {
  //ID중복체크
  let findId = ''
  let findUpCdId = ''

  if (insertParam.value !== null) {
    resData.value?.forEach((item) => {
      if (
        item.codeId == insertParam.value.codeId &&
        item.upperCodeId == insertParam.value.upperCodeId
      ) {
        findId = item.codeId
        findUpCdId = item.upperCodeId
      }
    })
    if (readonly.value != true) {
      // if (insertParam.value.cdId == '' || insertParam.value.cdNm == '' || insertParam.value.sortSn == '') {
      //     alert('필수 항목을 모두 입력해주세요')
      //     return
      // } else {
      if (
        insertParam.value.codeId == findId &&
        insertParam.value.upperCodeId == findUpCdId
      ) {
        alert('이미 등록된 코드입니다.')
        return
      } else {
        submit()
      }
      // }
    } else {
      // readonly.value = true 일시, cdid 중복 체크 X
      selected.value?.forEach((item) => {
        updateParam.value = { ...item }
      })

      if (
        updateParam.value.codeNm == insertParam.value.codeNm &&
        updateParam.value.sortOrdr == insertParam.value.sortOrdr &&
        updateParam.value.upperCodeId == insertParam.value.upperCodeId
      ) {
        alert('변경된 내용이 없습니다.')
        return
      }
      submit()
    }
  }
}

const submit = async () => {
  //그룹코드사용여부
  const bool = groupCdCheck.value
  if (bool === true) {
    insertParam.value.groupCodeAt = 'N'
    if (insertParam.value.upperCodeId == '') {
      insertParam.value.groupCodeAt = 'Y'
    }
  } else {
    insertParam.value.groupCodeAt = 'Y'
    insertParam.value.upperCodeId = ''
  }

  const result = await $fetch<ApiResponse<Data[]>>(
    '/playground/public/code/codeSave',
    {
      method: 'POST',
      body: JSON.stringify(insertParam.value)
    }
  )
  alert('등록되었습니다.')
  prompt.value = false
  codeReset()
}

const codeReset = () => {
  groupCdCheck = ref(false)

  selected = ref<Data[]>()

  deleteData.value = {
    codeId: '',
    codeNm: '',
    upperCodeId: '',
    groupCodeAt: '',
    sortOrdr: 0,
    registUsrId: '',
    updtUsrId: ''
  }
  insertParam.value = {
    codeId: '',
    codeNm: '',
    upperCodeId: '',
    groupCodeAt: '',
    sortOrdr: 0,
    registUsrId: '',
    updtUsrId: ''
  }

  updateParam.value = {
    codeId: '',
    codeNm: '',
    upperCodeId: '',
    groupCodeAt: '',
    sortOrdr: 0,
    registUsrId: '',
    updtUsrId: ''
  }
  codeSearch()
  SearchAll()
}

onMounted(() => {
  SearchAll()
  codeSearch()
})
</script>

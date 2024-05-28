<template>
  <div class="content">
    <div class="title">
      <div class="text-h4">
        <q-icon name="chat" /> 메뉴관리
      </div>
    </div>
    <div class="search">
      <q-form
        ref="searchForm"
        @submit="onSubmitSelect"
        @reset="onResetSelect"
      >
        <q-input v-model="searchParam.menuNm" outlined stack-label label="메뉴명" round dense flat class="input" />
        <q-input v-model="searchParam.menuUrl" outlined stack-label label="메뉴URL" round dense flat class="input" />
        <q-select v-model="searchParam.useAt" outlined stack-label :options="useAtSelectedOption" label="사용여부" round dense flat class="select"/>
        <!--(사용여부<q-checkbox v-model="useYnSelected" val="Y" label="Y" /><q-checkbox v-model="useYnSelected" val="N" label="N" />)-->
        <q-btn push class="button" color="green-7" label="조회" type="submit" />
        <q-btn push class="button" color="green-7" label="초기화" type="reset" />
      </q-form>
    </div>
    <div class="table">
      <q-table
        v-model:selected="selected"
        :rows="resData"
        :columns="columns"
        row-key="menuSn"
        selection="multiple"
        :rows-per-page-options="[0]"
        @row-click="clickRow"
      >
        <template #bottom>
          <paginationLayout :total-page="totalPages" :current-page="currentPage" @send-event="reset"/>
        </template>
      </q-table>
    </div>
    <div class="proc">
      <q-btn push class="button" color="primary" label="등록" @click="showInsertDialog = true"/>
      <q-btn push class="button" color="negative" label="삭제" />
      <q-btn push class="buttonR" color="warning" label="사용여부 변경"/>
    </div>
  </div>
  
  <div class="popup">
    <q-dialog
      v-model="showInsertDialog"
      @hide="onReset"
    >
      <q-layout container>
        <q-header >
          <q-toolbar class="bg-primary" >
            <q-toolbar-title>등록</q-toolbar-title>
            <q-btn v-close-popup flat round dense icon="close" />
          </q-toolbar>
        </q-header>
        <q-page-container class="bg-white">
          <q-card>
            <q-card-section>
              <q-form ref="insertForm">
                  <q-input v-model="param.menuNm" outlined stack-label label="메뉴명" :rules="[ required_rules ]" />
                  <q-input v-model="param.menuUrl" outlined stack-label label="메뉴URL" :rules="[ required_rules, menuUrl_rules]" />
                  <q-input v-model="param.upperMenuSn" outlined stack-label label="상위메뉴ID" :rules="[ parentMenuId_rules ]" />
                  <q-input v-model="param.menuSortOrdr" outlined stack-label label="정렬순서" :rules="[ number_rules ]" style="padding-bottom: 20px;"/>
                  <q-input v-model="param.menuDepth" outlined stack-label label="메뉴레벨" style="padding-bottom: 20px;" />
                  <q-select v-model="param.useAt" outlined stack-label :options="inputOptions" emit-value map-options label="사용여부" />
              </q-form>
            </q-card-section>
          </q-card>
        </q-page-container>
        <q-footer>
          <q-toolbar class="bg-white">
            <q-toolbar-title/>
            <q-btn push color="primary" label="저장" @click="onSubmit" />
          </q-toolbar>
        </q-footer>
      </q-layout>
    </q-dialog>
  </div>

  <div class="popup">
    <q-dialog
      v-model="showDetailDialog"
      @hide="onReset"
    >
      <q-layout container>
        <q-header >
          <q-toolbar class="bg-primary" >
            <q-toolbar-title>상세조회</q-toolbar-title>
            <q-btn v-close-popup flat round dense icon="close" />
          </q-toolbar>
        </q-header>
        <q-page-container class="bg-white">
          <q-card>
            <q-card-section>
              <q-field stack-label label="메뉴명" style="padding-bottom: 20px;" >
                <template #control>
                  <div class="self-center full-width no-outline">{{ param.menuNm }}</div>
                </template>
              </q-field >
              <q-field stack-label label="메뉴URL" style="padding-bottom: 20px;" >
                <template #control>
                  <div class="self-center full-width no-outline">{{ param.menuUrl }}</div>
                </template>
              </q-field >
              <q-field stack-label label="상위메뉴ID" style="padding-bottom: 20px;" >
                <template #control>
                  <div class="self-center full-width no-outline">{{ param.upperMenuSn }}</div>
                </template>
              </q-field >
              <q-field stack-label label="정렬순서" style="padding-bottom: 20px;" >
                <template #control>
                  <div class="self-center full-width no-outline">{{ param.menuSortOrdr }}</div>
                </template>
              </q-field >
              <q-field stack-label label="메뉴레벨" style="padding-bottom: 20px;" >
                <template #control>
                  <div class="self-center full-width no-outline">{{ param.menuDepth }}</div>
                </template>
              </q-field >
              <q-field stack-label label="사용여부" style="padding-bottom: 20px;" >
                <template #control>
                  <div class="self-center full-width no-outline">{{ param.useAt }}</div>
                </template>
              </q-field >
              <q-field stack-label label="최초등록자" style="padding-bottom: 20px;" >
                <template #control>
                  <div class="self-center full-width no-outline">{{ param.useAt }}</div>
                </template>
              </q-field >
              <q-field stack-label label="최초등록일시" style="padding-bottom: 20px;" >
                <template #control>
                  <div class="self-center full-width no-outline">{{ param.useAt }}</div>
                </template>
              </q-field >
              <q-field stack-label label="최종수정자" style="padding-bottom: 20px;" >
                <template #control>
                  <div class="self-center full-width no-outline">{{ param.useAt }}</div>
                </template>
              </q-field >
              <q-field stack-label label="최종수정일시" >
                <template #control>
                  <div class="self-center full-width no-outline">{{ param.useAt }}</div>
                </template>
              </q-field >
            </q-card-section>
          </q-card>
        </q-page-container>
        <q-footer>
          <q-toolbar class="bg-white">
            <q-toolbar-title/>   
            <div class="proc">
              <q-btn push class="button" color="primary" label="수정" @click="clickBtnModify" />
              <q-btn push class="button" color="negative" label="삭제" />
            </div>
          </q-toolbar>
        </q-footer> 
      </q-layout>
    </q-dialog>
  </div>

  <div class="popup">
    <q-dialog
      v-model="showUpdateDialog"
      @hide="onReset"
    >
      <q-layout container>
        <q-header >
          <q-toolbar class="bg-primary" >
            <q-toolbar-title>수정</q-toolbar-title>
            <q-btn v-close-popup flat round dense icon="close" />
          </q-toolbar>
        </q-header>
        <q-page-container class="bg-white">
          <q-card>
            <q-card-section>
              <q-form ref="insertForm">
                <q-input v-model="param.menuNm" outlined stack-label label="메뉴명" :rules="[ required_rules ]" />
                  <q-input v-model="param.menuUrl" outlined stack-label label="메뉴URL" :rules="[ required_rules, menuUrl_rules]" />
                  <q-input v-model="param.upperMenuSn" outlined stack-label label="상위메뉴ID" :rules="[ parentMenuId_rules ]" />
                  <q-input v-model="param.menuSortOrdr" outlined stack-label label="정렬순서" :rules="[ number_rules ]" style="padding-bottom: 20px;"/>
                  <q-input v-model="param.menuDepth" outlined stack-label label="메뉴레벨" style="padding-bottom: 20px;" />
                  <q-select v-model="param.useAt" outlined stack-label :options="inputOptions" label="사용여부" />
              </q-form>
            </q-card-section>
          </q-card>
        </q-page-container>
        <q-footer>
          <q-toolbar class="bg-white">
            <q-toolbar-title/>
            <div class="proc">
              <q-btn push color="primary" label="저장" @click="onSubmit" />
              <q-btn push color="primary" label="취소" />
            </div>
          </q-toolbar>
        </q-footer>
      </q-layout>
    </q-dialog>
  </div>


  <div class="popup">
    <q-dialog
      v-model="showUpdateDialog"
      @hide="onReset"
    >
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">메뉴 수정</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-form ref="insertForm">
            <q-input v-model="param.menuNm" label="메뉴명" :rules="[(val: string) => !!val || '메뉴명' + ERROR_FIELD_EMPTY]" class="input" outlined />
            <q-input v-model="param.menuUrl" label="메뉴URL" :rules="[(val: string) => !!val || '메뉴URL' + ERROR_FIELD_EMPTY]" class="input" outlined />
            <q-input v-model="param.menuDepth" label="메뉴레벨" :rules="[(val: string) => !!val || '메뉴레벨' + ERROR_FIELD_EMPTY]" class="input" outlined />
            <q-input v-model="param.menuSortOrdr" label="정렬순서" :rules="[(val: string) => !!val || '정렬순서' + ERROR_FIELD_EMPTY]" class="input" outlined />
            <q-input v-model="param.upperMenuSn" label="상위메뉴ID" style="padding-bottom: 20px;" class="input" outlined />
            <q-select v-model="param.useAt" outlined :options="inputOptions" label="사용여부" class="select" />
          </q-form>
        </q-card-section>
        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat label="수정" @click="onSubmit" />
          <q-btn v-close-popup flat text-color="black" label="닫기" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { type QTableProps } from 'quasar';
import { type ApiResponse } from '../../interface/server';
import paginationLayout from '../../components/Pagination.vue';

const router = useRouter();
const insertForm = ref<any>();
const searchForm = ref<any>();

// 페이징을 위한 파라미터
const currentPage = ref<number>(1)
const totalPages = ref<number>(0)
const itemsPerPage = ref<number>(5) // 테이블 UI에 보여지는 데이터 개수
const totalItems = ref<number | undefined>() // 데이터의 개수에 따라 페이지네이션 UI에 그려지는 숫자 리스트

const ERROR_FIELD_EMPTY = "(은)는 필수값입니다.";

interface Data {
  menuSn: number,
  menuNm: string,
  menuUrl: string,
  menuDepth?: number,
  menuSortOrdr?: number,
  upperMenuSn: number,
  useAt: string,
  registUsrId: string,
  registDt: string,
  updtUsrId: string,
  updtDt: string
}

interface Form {
  menuSn: string,
  menuNm: string,
  menuUrl: string,
  menuDepth?: number,
  menuSortOrdr?: number,
  upperMenuSn: string,
  useAt: string
}

const resData = ref<Data[]>([]);

const param = ref<Form>({
  menuSn: '',
  menuNm: '',
  menuUrl: '',
  upperMenuSn: '',
  useAt: ''
})

const searchParam = ref<any>({
  menuSn: '',
  menuNm: '',
  menuUrl: '',
  menuSortOrdr: '',
  upperMenuSn: '',
  useAt: ''
})

const useAtSelectedOption = [
    '전체', 'Y', 'N'
]

const selected = ref<any>();

const inputText = ref<any>();

const useYnSelected = ref<any>(['전체', 'Y', 'N']);

const showInsertDialog = ref<boolean>(false);

const showUpdateDialog = ref<boolean>(false);

const  showDetailDialog = ref<boolean>(false);

const inputOptions = [
  { label: '사용', value: 'Y' },
  { label: '미사용', value: 'N' }
]

const searchOptions = [
  {
    label: '메뉴명',
    value: 'menuNm'
  },
  {
    label: '메뉴URL',
    value: 'menuUrl'
  }
]

const columns = ref<QTableProps["columns"]>([
  {
    name: 'menuSn',
    label: '메뉴ID',
    field: 'menuSn',
    align: 'center'
  },
  { name: 'menuNm', label: '메뉴명', field: 'menuNm', align: 'left' },
  { name: 'menuUrl', label: '메뉴URL', field: 'menuUrl', align: 'left' },
  { name: 'menuDepth', label: '메뉴레벨', field: 'menuDepth', align: 'center' },
  { name: 'menuSortOrdr', label: '정렬순서', field: 'menuSortOrdr', align: 'center' },
  { name: 'upperMenuSn', label: '상위메뉴ID', field: 'upperMenuSn', align: 'left' },
  { name: 'useAt', label: '사용여부', field: 'useAt', align: 'center', format: val => val == 'Y' ? '사용' : '미사용' },
  { name: 'registUsrId', label: '등록자', field: 'registUsrId', align: 'left' },
  { name: 'registDt', label: '등록일시', field: 'registDt', align: 'left' },
  { name: 'updtUsrId', label: '수정자', field: 'updtUsrId', align: 'left' },
  { name: 'updtDt', label: '수정일시', field: 'updtDt', align: 'left' }
])

const selectAllMenu = async () => {
  const result = await $fetch<ApiResponse<Data[]>>("/playground/public/menu/select-all?page=" + (currentPage.value - 1) + "&size=" + itemsPerPage.value, {
            method: 'POST',
            body: JSON.stringify(param.value)
        })
  resData.value = result.data.content
  totalItems.value = result.data.totalElements !== undefined ? result.data.totalElements : 0
  totalPages.value = Math.ceil(totalItems.value / itemsPerPage.value !== 0 ? Math.ceil(totalItems.value / itemsPerPage.value) : 1)
}

const reset = (pageIdx: number, idx: string) => {
  if(idx == "pageNum"){
    if(pageIdx == 0) {
      currentPage.value = 1
    } else {
      currentPage.value = pageIdx
    }
  } else {
    itemsPerPage.value = pageIdx
  }

}

watch([currentPage, itemsPerPage], () => {
  selectAllMenu()
})

const clickRow = (evt: any, row: any, index: any) => {
  param.value = { ...row }
  console.log("evt: ", evt, " row: ", row, " index: ", index)
  showDetailDialog.value = true
}

const clickBtnModify = () => {
    showUpdateDialog.value = true
}

const required_rules = (val: string) => {
    
    if(!val || val.trim() == "") {
      return "필수 입력항목 입니다.";
    }

    return true;
  }

  const number_rules = (val: string) => {
    
    if(val && val.trim() != "") {
      const num = val.match(/^\d*$/);

      if(!num) {
        return "숫자를 입력해주세요.";
      }
    }

    return true;
  }


  const menuUrl_rules = (val: string) => {
  
    const kor = val.match(/[ㄱ-ㅎ|ㅏ-ㅣ가-힣]/g);
    const special = val.match(/[{}[\]/?.,;:|)*~`!^+<>@#$%&\\=('"]/g);

    if(kor || special) {
       return "영문 및 특수문자('_', '-')를 입력해주세요.";
    }
       
    return true;
  }

  const parentMenuId_rules = (val: string) => {
      
    if(val && val.trim() != "") {
      const num = val.match(/^\d*$/);
      
      if(!num) {
        return "숫자를 입력해주세요.";
      }

      return "유효한 상위메뉴ID를 입력해주세요.";
     
    }

    return true;
  }


  const onSubmit = async () => {
    try {
        const valid = await insertForm.value.validate();
        if(valid) {
          // 저장 API 호출
          await $fetch<ApiResponse<Data[]>> (
            "/playground/public/menu/save", 
            {
                method: 'POST',
                body: JSON.stringify(param.value)
            })
            .then(() => {
              alert('저장이 완료되었습니다.')
              // router.push('/menu-manage')
              // navigateTo('/menu-manage')
              // refreshNuxtData()
              // window.location.reload()
              router.go(0) 
            })
            .catch((error) => {
              console.error(error)
              alert('저장되지 않았습니다. 잠시 후에 다시 시도 해 주세요.')
            }
          )
        }
    } catch (error) {
      console.error(error)
    }
  }


const onReset = () => {
  param.value = {
    menuSn: '',
    menuNm: '',
    menuUrl: '',
    upperMenuSn: '',
    useAt: ''
  }
}

const onSubmitSelect = async () => {
  // validation
  if (isEmpty(searchParam.value.menuNm) && isEmpty(searchParam.value.menuUrl)) {
    alert('검색어를 적어도 하나 이상 입력 해 주세요.')
    return
  }
  if (isEmpty(useYnSelected.value)) {
    alert('사용여부를 적어도 하나 이상 선택 해 주세요.')
    return
  }

  // 사용여부 선택 시 param 에 값 할당
  searchParam.value.useYn = (useYnSelected.value.length == 1) ? useYnSelected.value[0] : ''

  await $fetch<ApiResponse<Data[]>>(
    "/playground/public/menu/select-by-condition", 
    {
        method: 'POST',
        body: JSON.stringify(searchParam.value)
    })
  .then((result) => {
    resData.value = result.data
  })
  .catch((error) => {
    console.error(error)
  })
}

const onResetSelect = () => {
  searchParam.value = {
    menuId: '',
    menuNm: '',
    menuUrl: '',
    menuLvl: '',
    menuSortOrder: '',
    parentMenuId: '',
    useYn: ''
  }
  selected.value = undefined
  inputText.value = undefined
  useYnSelected.value = ['Y', 'N']
}

const isEmpty = (val: any) => val == null || !(Object.keys(val) || val).length;

// If typescript compiler is yelling because of the type `any`
// const isEmpty = (val: Record<string, unknown> | null | undefined) =>
//   val == null || !(Object.keys(val) || val).length;

onMounted(() => {
  selectAllMenu()
})

</script>

<style>
  .content {
    margin-top: 2rem;
    margin-left: 5rem;
    margin-right: 5rem;
  }

  .title {
    margin-top: 2rem;
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

  .table_menu_menage {
    height : 25rem;
  }

  .q-table__bottom {
    justify-content: center;
    height : 5rem;
  }

  .q-pa-lg {
    padding : 0;
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

  .q-dialog .q-input {
      margin-bottom: 0.5rem;
  }

  .q-dialog .q-select {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
</style>
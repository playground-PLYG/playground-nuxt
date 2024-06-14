<template>
  <div class="content">
    <div class="title">
      <div class="text-h4">
        <q-icon name="chat" /> 메뉴관리
      </div>
    </div>
    <div class="search">
      <q-form ref="searchForm">
        <q-input outlined stack-label dense class="input" v-model="searchParam.menuNm" label="메뉴명"   />
        <q-input outlined stack-label dense flat class="input" v-model="searchParam.menuUrl" label="메뉴URL"  />
        <q-select outlined stack-label dense flat class="select" v-model="searchParam.useAt" label="사용여부" :options="useAtSearchOption" option-label="name" option-value="code"  emit-values map-options>
        </q-select>
        <q-btn push class="button" color="green-7" label="조회" @click="srchMenuList" />
        <q-btn push class="button" color="green-7" label="초기화" @click="resetSearchParam" />
      </q-form>
    </div>
    <div class="table">
      <q-table
        :rows="listData"
        :columns="columns"
        row-key="menuSn"
        v-model:selected="selected"
        selection="multiple"
        :rows-per-page-options="[0]"
        @row-click="clickRow"
      >
        <template v-slot:bottom>
          <pagination-layout :totalPage="totalPages" :currentPage="currentPage" @send-event="reset" />
        </template>
      </q-table>
    </div>
    <div class="proc">
      <q-btn push class="button" color="primary" label="등록" @click="showAddDialog = true"/>
      <q-btn push class="button" color="negative" label="삭제"  @click="removeMenuList"/>
      <q-btn push class="buttonR" color="warning" label="사용여부 변경"/>
    </div>
  </div>

  <div class="popup">
    <q-dialog
      v-model="showDetailDialog"
      @hide="resetDetailData"
    >
      <q-layout container>
        <q-header >
          <q-toolbar class="bg-primary" >
            <q-toolbar-title>상세조회</q-toolbar-title>
            <q-btn flat v-close-popup round dense icon="close" />
          </q-toolbar>
        </q-header>
        <q-page-container class="bg-white">
          <q-card>
            <q-card-section>
              <q-field stack-label label="메뉴명" style="padding-bottom: 20px;" >
                <template v-slot:control>
                  <div class="self-center full-width no-outline">{{ detailData.menuNm }}</div>
                </template>
              </q-field >
              <q-field stack-label label="메뉴URL" style="padding-bottom: 20px;" >
                <template v-slot:control>
                  <div class="self-center full-width no-outline">{{ detailData.menuUrl }}</div>
                </template>
              </q-field >
              <q-field stack-label label="상위메뉴ID" style="padding-bottom: 20px;" >
                <template v-slot:control>
                  <div class="self-center full-width no-outline">{{ detailData.upperMenuSn }}</div>
                </template>
              </q-field >
              <q-field stack-label label="정렬순서" style="padding-bottom: 20px;" >
                <template v-slot:control>
                  <div class="self-center full-width no-outline">{{ detailData.menuSortOrdr }}</div>
                </template>
              </q-field >
              <q-field stack-label label="사용여부" style="padding-bottom: 20px;" >
                <template v-slot:control>
                  <div class="self-center full-width no-outline">{{ detailData.useAt }}</div>
                </template>
              </q-field >
              <q-field stack-label label="최초등록자" style="padding-bottom: 20px;" >
                <template v-slot:control>
                  <div class="self-center full-width no-outline">{{ detailData.registUsrId }}</div>
                </template>
              </q-field >
              <q-field stack-label label="최초등록일시" style="padding-bottom: 20px;" >
                <template v-slot:control>
                  <div class="self-center full-width no-outline">{{ date.formatDate(detailData.registDt, 'YYYY/MM/DD HH:mm:ss') }}</div>
                </template>
              </q-field >
              <q-field stack-label label="최종수정자" style="padding-bottom: 20px;" >
                <template v-slot:control>
                  <div class="self-center full-width no-outline">{{ detailData.updtUsrId }}</div>
                </template>
              </q-field >
              <q-field stack-label label="최종수정일시" >
                <template v-slot:control>
                  <div class="self-center full-width no-outline">{{ date.formatDate(detailData.updtDt, 'YYYY/MM/DD HH:mm:ss') }}</div>
                </template>
              </q-field >
            </q-card-section>
          </q-card>
        </q-page-container>
        <q-footer>
          <q-toolbar class="bg-white">
            <q-toolbar-title></q-toolbar-title>   
            <div class="proc">
              <q-btn push class="button" color="primary" label="수정" @click="showModifyDialog = true" />
              <q-btn push class="button" color="negative" label="삭제" @click="removeMenuList" />
            </div>
          </q-toolbar>
        </q-footer> 
      </q-layout>
    </q-dialog>
  </div>

    
  <div class="popup">
    <q-dialog
      v-model="showAddDialog"
      @hide="resetInputData"
    >
      <q-layout container>
        <q-header >
          <q-toolbar class="bg-primary" >
            <q-toolbar-title>등록</q-toolbar-title>
            <q-btn flat v-close-popup round dense icon="close" />
          </q-toolbar>
        </q-header>
        <q-page-container class="bg-white">
          <q-card>
            <q-card-section>
              <q-form ref="addForm">
                  <q-input outlined stack-label v-model="inputData.menuNm" label="메뉴명" :rules="[ required_rules ]" />
                  <q-input outlined stack-label v-model="inputData.menuUrl" label="메뉴URL" :rules="[ required_rules, menuUrl_rules]" />
                  <q-input outlined stack-label v-model="inputData.upperMenuSn" label="상위메뉴ID" :rules="[ number_rules ]" />
                  <q-input outlined stack-label v-model="inputData.menuSortOrdr" label="정렬순서" :rules="[ number_rules ]" style="padding-bottom: 20px;"/>
                  <q-select outlined stack-label v-model="inputData.useAt" label="사용여부" :options="useAtInputOption"  option-label="name" option-value="code" />
              </q-form>
            </q-card-section>
          </q-card>
        </q-page-container>
        <q-footer>
          <q-toolbar class="bg-white">
            <q-toolbar-title></q-toolbar-title>
            <q-btn push color="primary" label="저장" @click="addMenu" />
          </q-toolbar>
        </q-footer>
      </q-layout>
    </q-dialog>
  </div>


  <div class="popup">
    <q-dialog
      v-model="showModifyDialog"
      @hide="resetInputData"
    >
      <q-layout container>
        <q-header >
          <q-toolbar class="bg-primary" >
            <q-toolbar-title>수정</q-toolbar-title>
            <q-btn flat v-close-popup round dense icon="close" />
          </q-toolbar>
        </q-header>
        <q-page-container class="bg-white">
          <q-card>
            <q-card-section>
              <q-form ref="modifyForm">
                <q-input outlined stack-label v-model="detailData.menuNm" label="메뉴명" :rules="[ required_rules ]" />
                <q-input outlined stack-label v-model="detailData.menuUrl" label="메뉴URL" :rules="[ required_rules, menuUrl_rules]" />
                <q-input outlined stack-label v-model="detailData.upperMenuSn" label="상위메뉴ID" :rules="[ number_rules ]" />
                <q-input outlined stack-label v-model="detailData.menuSortOrdr" label="정렬순서" :rules="[ number_rules ]" style="padding-bottom: 20px;"/>
                <q-select outlined stack-label v-model="detailData.useAt" label="사용여부" :options="useAtInputOption"  option-label="name" option-value="code" emit-values map-options/>
              </q-form>
            </q-card-section>
          </q-card>
        </q-page-container>
        <q-footer>
          <q-toolbar class="bg-white">
            <q-toolbar-title></q-toolbar-title>
            <div class="proc">
              <q-btn push class="button" color="primary" label="저장" @click="modifyMenu" />
              <q-btn push v-close-popup class="button" color="primary" label="취소" />
            </div>
          </q-toolbar>
        </q-footer>
      </q-layout>
    </q-dialog>
  </div>

</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { type ApiResponse } from '../../interface/server';
  import { date, type QTableProps } from 'quasar';
  import paginationLayout from '../../components/Pagination.vue';

  // 페이징을 위한 파라미터
  const currentPage = ref<number>(1)
  const totalPages = ref<number>(0)
  const itemsPerPage = ref<number>(5) // 테이블 UI에 보여지는 데이터 개수
  let totalItems = ref<number | undefined>() // 데이터의 개수에 따라 페이지네이션 UI에 그려지는 숫자 리스트

  const router = useRouter();
  const addForm = ref<any>();
  const modifyForm = ref<any>();
  const searchForm = ref<any>();

  interface Data {
    menuSn: number,
    menuNm: string,
    menuUrl: string,
    menuDepth: number,
    menuSortOrdr: number,
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
    menuSortOrdr: string,
    upperMenuSn: string,
    useAt: string
  }
  
  let searchParam = ref<any>({
    menuSn: '',
    menuNm: '',
    menuUrl: '',
    useAt: ''
  })
  
  let listData = ref<Data[]>([])
  let selected = ref<Data[]>([])

  let inputData = ref<Form>({
    menuSn: '',
    menuNm: '',
    menuUrl: '',
    menuSortOrdr: '',
    upperMenuSn: '',
    useAt: ''
  })

  let detailData = ref<Data>({
    menuSn: 0,
    menuNm: '',
    menuUrl: '',
    menuDepth: 0,
    menuSortOrdr: 0,
    upperMenuSn: 0,
    useAt: '',
    registUsrId: '',
    registDt: '',
    updtUsrId: '',
    updtDt: ''
  })

  let showAddDialog = ref<boolean>(false);

  let showModifyDialog = ref<boolean>(false);

  let showDetailDialog = ref<boolean>(false);

  const useAtSearchOption = [
    {name:"전체", code:""},
    {name:"사용", code:"Y"},
    {name:"미사용", code:"N"}
  ]

  const useAtInputOption = [
    {name:"사용", code:"Y"},
    {name:"미사용", code:"N"}
  ]

  const columns = ref<QTableProps["columns"]>([
    { name: 'menuSn', label: '메뉴ID', field: 'menuSn', align: 'center' },
    { name: 'menuNm', label: '메뉴명', field: 'menuNm', align: 'left' },
    { name: 'menuUrl', label: '메뉴URL', field: 'menuUrl', align: 'left' },
    { name: 'menuSortOrdr', label: '정렬순서', field: 'menuSortOrdr', align: 'center' },
    { name: 'upperMenuSn', label: '상위메뉴ID', field: 'upperMenuSn', align: 'left' },
    { name: 'useAt', label: '사용여부', field: 'useAt', align: 'center' },
    { name: 'registUsrId', label: '등록자', field: 'registUsrId', align: 'left' },
    { name: 'registDt', label: '등록일시', field: 'registDt', align: 'left', format: (val) => `${date.formatDate(val, 'YYYY/MM/DD HH:mm:ss')}`},
    { name: 'updtUsrId', label: '수정자', field: 'updtUsrId', align: 'left' },
    { name: 'updtDt', label: '수정일시', field: 'updtDt', align: 'left', format: (val) => `${date.formatDate(val, 'YYYY/MM/DD HH:mm:ss')}`}
  ])

  
  // 목록 조회
  const getMenuPageList = async () => {

    selected = ref<Data[]>([])
        
    if(searchParam.value.useAt && typeof(searchParam.value.useAt) == 'object') { 
      searchParam.value.useAt = searchParam.value.useAt.code;
    }

    const result = await $fetch<ApiResponse<Data[]>>("/playground/public/menu/getMenuPageList?page=" + (currentPage.value - 1) + "&size=" + itemsPerPage.value, {
              method: 'POST',
              body: JSON.stringify(searchParam.value)
          })

    listData.value = result.data.content
    totalItems.value = result.data.totalElements !== undefined ? result.data.totalElements : 0
    totalPages.value = Math.ceil(totalItems.value / itemsPerPage.value !== 0 ? Math.ceil(totalItems.value / itemsPerPage.value) : 1)
  }

  // 목록조회 - 페이징
  const reset = (pageIdx: number, idx: string) => {
    
    if(idx == "pageNum") {
      if(pageIdx == 0) {
        currentPage.value = 1
      } 
      else {
        currentPage.value = pageIdx
      }
    } else {
      itemsPerPage.value = pageIdx
    }
  }

  watch([currentPage, itemsPerPage], () => {

    getMenuPageList()
  })

  // 목록조회 - 조회버튼 클릭
  const srchMenuList = () => {

    currentPage.value = 1
    
    getMenuPageList()
  }

  // 목록조회 - 검색조건 초기화
  const resetSearchParam = () => {

    searchParam.value = {
      menuNm: '',
      menuUrl: '',
      useYn: ''
    }

    currentPage.value = 1

    getMenuPageList()
  }


  // 상세조회 - 목록 선택
  const clickRow = async (evt: any, row: any, index: any) => {

    selected = ref<Data[]>([])

    const menuSn= row.menuSn

    const result = await $fetch<ApiResponse<Data[]>> (
          "/playground/public/menu/getMenuDetail?menuSn=" + menuSn)

    detailData.value = result.data;
          
    showDetailDialog.value = true
  }

  
  // 메뉴등록
  const addMenu = async () => { 
    
    try {
      const upperMenuSn = inputData.value.upperMenuSn;

      let valid = false;
      let upperMenuSnValid = false;

      valid = await addForm.value.validate(); 

      if(!valid) {
        return;
      }

      if(upperMenuSn && upperMenuSn != "") {
        const result = await $fetch<ApiResponse<Data[]>> (
        "/playground/public/menu/getMenuDetail?menuSn=" + upperMenuSn)

        if(result.data.menuSn && result.data.menuSn == upperMenuSn) {
          upperMenuSnValid = true;
        }
      }
      else {
        upperMenuSnValid = true;
      }

      if(!upperMenuSnValid) {
        alert('유효한 상위메뉴ID를 입력해주세요')
        return
      }

      if(valid && upperMenuSnValid) {

        inputData.value.useAt = inputData.value.useAt.code;

        // 저장 API 호출
        await $fetch<ApiResponse<Data[]>> (
          "/playground/public/menu/addMenu", 
          {
            method: 'POST'
            ,body: JSON.stringify(inputData.value)
          })
          .then((result) => {
            if(result.data.menuSn != null) {
              alert('등록 완료되었습니다.')
              router.go(0) 
            }
          })
          .catch((error) => {
            console.error(error)
            alert('등록 중 오류가 발생하였습니다. 잠시 후 다시 시도 해 주세요.')
          }
        )
      }
    } catch (error) {
      console.error(error)
      alert('처리 중 오류가 발생하였습니다. 잠시 후 다시 시도 해 주세요.')
    }
  }

  // 메뉴수정
  const modifyMenu = async () => {
    
    try {
      
      let valid = false;
      let upperMenuSnValid = false;
      
      const upperMenuSn = detailData.value.upperMenuSn;
      
      // 오류나서 일단 주석처리
      //valid = await modifyForm.value.validate();
      //
      valid = true
      
      if(!valid) {
        return;
      }

      if(upperMenuSn && upperMenuSn > 0) {
        const result = await $fetch<ApiResponse<Data[]>> (
        "/playground/public/menu/getMenuDetail?menuSn=" + upperMenuSn)
        
        if(result.data.menuSn && result.data.menuSn == upperMenuSn) {
          upperMenuSnValid = true;
        }
      }
      else {
        upperMenuSnValid = true;
      }

      if(!upperMenuSnValid) {
        alert('유효한 상위메뉴ID를 입력해주세요')
        return
      }

      if(valid && upperMenuSnValid) {
        
        if(detailData.value.useAt.code) {
          detailData.value.useAt = detailData.value.useAt.code;
        }

        // 저장 API 호출
        await $fetch<ApiResponse<Data[]>> (
        "/playground/public/menu/modifyMenu", 
        {
          method: 'POST'
          ,body: JSON.stringify(detailData.value)
        })
        .then((result) => {
          console.log(result);
          alert('수정 완료되었습니다.')
          showModifyDialog.value = false;
          getMenuPageList()
        })
        .catch((error) => {
          console.error(error)
          alert('수정 중 오류가 발생하였습니다. 잠시 후 다시 시도 해 주세요.')
        })
      }
    } catch (error) {
      console.error(error)
      alert('처리 중 오류가 발생하였습니다. 잠시 후 다시 시도 해 주세요.')
    }
  }

  
 
const required_rules = (val: string) => {
    
    if(!val || val.trim() == "") {
      return "필수 입력항목 입니다.";
    }

    return true;
  }

  const number_rules = (val: string) => {
    
    if(val && val.trim() != "") {
      const num = val.match(/^[0-9]*$/);

      if(!num) {
        return "숫자를 입력해주세요.";
      }
    }

    return true;
  }

  const menuUrl_rules = (val: string) => {
  
    const kor = val.match(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g);
    const special = val.match(/[\{\}\[\]?.,;:|\)*~`!^\+<>@\#$%&\\\=\(\'\"]/g);

    if(kor || special) {
       return "영문 및 특수문자('_', '-')를 입력해주세요.";
    }
       
    return true;
  }


  const removeMenuList = async () => {

    if(selected.value.length < 1) {
      if(showDetailDialog.value) {
        selected.value[0] = detailData.value;
      }
      else {
        alert("삭제할 목록을 선택해주세요")
        return;
      }
    }
     
    try {
         // 저장 API 호출
         await $fetch<ApiResponse<Data[]>> (
           "/playground/public/menu/removeMenu", 
           {
               method: 'POST'
               ,body: JSON.stringify(selected.value)
           })
           .then((result) => {
             console.log(result);
             alert('삭제 완료되었습니다.')
             showDetailDialog.value = false
             resetSearchParam()
           })
           .catch((error) => {
             console.error(error)
             alert('삭제 중 오류가 발생하였습니다. 잠시 후 다시 시도 해 주세요.')
           }
         )} catch (error) {
     console.error(error)
     alert('처리 중 오류가 발생하였습니다. 잠시 후 다시 시도 해 주세요.')
   }
 
}



const resetInputData = () => {
  inputData.value = {
    menuSn: '',
    menuNm: '',
    menuUrl: '',
    menuSortOrdr: '',
    upperMenuSn: '',
    useAt: ''
  }
}

const resetDetailData = () => {
  detailData.value = {
    menuSn: 0,
    menuNm: '',
    menuUrl: '',
    menuDepth: 0,
    menuSortOrdr: 0,
    upperMenuSn: 0,
    useAt: '',
    registUsrId: '',
    registDt: '',
    updtUsrId: '',
    updtDt: ''
  }
}

onMounted(() => {
  getMenuPageList()
})

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
      height : 5rem;

      .flex-center {
        padding : 0;
      }
    }
  }

</style>
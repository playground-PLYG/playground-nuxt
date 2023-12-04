<template>
    <div class="q-pa-md">
        <div class="q-gutter-md row items-start">
            <q-input outlined v-model="param.cdId" label="코드ID" round dense flat />
            <q-input outlined v-model="param.cdNm" label="코드명" round dense flat />
            <q-input outlined v-model="param.upCdId" label="상위코드ID" round dense flat />
            <q-select outlined v-model="param.groupCdYn" :options="groupCdOptions" label="그룹코드여부" style="width: 200px" round
                dense flat>
                <template v-if="param.groupCdYn" v-slot:append>
                    <q-icon name="cancel" @click.stop.prevent="param.groupCdYn = ''" class="cursor-pointer" />
                </template>
            </q-select>
            <q-btn color="primary" label="조회" @click="codeSearch" value="codeSearch"></q-btn>
        </div>
    </div>

    <div class="q-pa-md">


        <q-table flat bordered title="코드관리" :rows="resData" row-key="sn" :columns="columns" selection="single"
            v-model:selected="selected" class="my-sticky-header-table">

            <template v-slot:top-right>
                <q-btn color="primary" label="등록/수정" @click="insert" />
                &ensp;
                <q-btn color="primary" label="삭제" @click="codeDelete" type="reset" />
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
                        <div>

                        </div>
                        <q-card-section class="q-pt-none">
                            <q-input dense v-model="insertParam.cdId" autofocus label="코드ID" filled :rules="[codeid_rules]"
                                :readonly="readonly" />
                            <q-input dense v-model="insertParam.cdNm" autofocus label="코드명" filled
                                :rules="[codeNm_rules]" />
                            <q-checkbox left-label v-model="groupCdCheck" label="상위코드 선택" />
                            <q-select v-if="groupCdCheck" filled v-model="insertParam.upCdId" :options="arr"
                                hint="상위코드를 선택하세요" :readonly="readonly">
                            </q-select>
                            <q-input dense type="number" v-model="insertParam.sortSn" autofocus label="정렬순번" filled
                                :rules="[sortSn_rules]" />
                        </q-card-section>
                        <q-card-actions align="right" class="text-primary">
                            <q-btn flat label="종료" type="reset" v-close-popup @click="codeReset" />
                            <q-btn flat label="등록" type="submit" />
                        </q-card-actions>
                    </q-form>
                </q-card>
            </q-dialog>
        </div>
    </template>
</template>


<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { type ApiResponse } from '../../interface/server';
import { date, type QTableProps } from 'quasar';

const columns = ref<QTableProps["columns"]>([
    { name: 'cdId', align: 'left', label: '코드ID', field: 'cdId', sortable: true },
    { name: 'cdNm', align: 'center', label: '코드명', field: 'cdNm' },
    { name: 'upCdId', align: 'center', label: '상위코드ID', field: 'upCdId', sortable: true },
    { name: 'groupCdYn', align: 'center', label: '그룹코드사용여부', field: 'groupCdYn' },
    { name: 'sortSn', align: 'center', label: '정렬순번', field: 'sortSn', sortable: true },
    { name: 'regMbrNo', align: 'center', label: '등록자', field: 'regMbrNo' },
    { name: 'regDt', align: 'center', label: '등록일시', field: 'regDt' },
    { name: 'mdfcnMbrNo', align: 'center', label: '수정자', field: 'mdfcnMbrNo' },
    { name: 'dfcnDt', align: 'center', label: '수정일시', field: 'dfcnDt' },
])


//let insertForm = ref<any>(null);
let prompt = ref(false);
let resData = ref<Data[]>();
let searchData = ref<Data[]>();
let selected = ref<Data[]>();
let groupCdCheck = ref(false);
var arr = new Array();
let readonly = ref(false);



//그룹코드여부
const groupCdOptions = [
    'Y', 'N'
]


// api로 조회할 검색 조건 데이터 구조
interface Search {
    cdId: string
    cdNm: string
    upCdId: string
    groupCdYn: string
    sortSn: string
    regMbrNo: string
    mdfcnMbrNo: string
}


// api로 조회할 데이터 구조
interface Data {
    sn: string
    cdId: string
    cdNm: string
    upCdId: string
    groupCdYn: string
    sortSn: string
    regMbrNo: string
    mdfcnMbrNo: string
    regDt: string
    dfcnDt: string
}


let param = ref<Search>({
    cdId: '',
    cdNm: '',
    upCdId: '',
    groupCdYn: '',
    sortSn: '',
    regMbrNo: '',
    mdfcnMbrNo: ''
});

let deleteData = ref<Search>({
    cdId: '',
    cdNm: '',
    upCdId: '',
    groupCdYn: '',
    sortSn: '',
    regMbrNo: '',
    mdfcnMbrNo: ''
});


let insertParam = ref<Search>({
    cdId: '',
    cdNm: '',
    upCdId: '',
    groupCdYn: '',
    sortSn: '',
    regMbrNo: '',
    mdfcnMbrNo: ''
});

let updateParam = ref<Search>({
    cdId: '',
    cdNm: '',
    upCdId: '',
    groupCdYn: '',
    sortSn: '',
    regMbrNo: '',
    mdfcnMbrNo: ''
});




const codeid_rules = (val: string) => {
    if (!val) {
        return '코드ID를 입력해주세요.';
    }
    const kor = val.match(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g);
    if (kor) {
        return '한글은 입력할 수 없습니다.'
    }
    const special = val.match(/[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/g);
    if (special) {
        return '특수문자는 입력할 수 없습니다.'
    }
    return true;
}

const codeNm_rules = (val: string) => {
    if (!val) {
        return '코드명을 입력해주세요.';
    }
    const special = val.match(/[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/g);
    if (special) {
        return '특수문자는 입력할 수 없습니다.'
    }
    return true;
}

const sortSn_rules = (val: string) => {
    if (!val) {
        return '정렬순번을 입력해주세요. 숫자만 입력 가능 합니다.';
    }
    return true;
}

//코드 조회
const codeSearch = async () => {

    const result = await $fetch<ApiResponse<Data[]>>("/playground/public/code/codeSearch", {
        method: 'POST',
        body: JSON.stringify(param.value)
    });
    resData.value = result.data;

}

//상위 코드 조회
const SearchAll = async () => {


    const result = await $fetch<ApiResponse<Data[]>>("/playground/public/code/selectUpCodeid", {
        method: 'GET'
    })
    searchData.value = result.data

    console.log(':::::::::::searchData', searchData)

    arr.length = 0;

    searchData.value.forEach((item) => {

        if (item.groupCdYn == 'Y') {
            const upcodeid = item.cdId
            arr.push(upcodeid)
        }
    })

    //중복 제거
    const set = new Set(arr);
    const uniqueArr = [...set];
    //정렬
    arr = uniqueArr.sort();
}



//코드 삭제
const codeDelete = async () => {

    let codeId = ''

    selected.value?.forEach(async (item) => {
        deleteData.value = { ...item }
    })
    codeId = deleteData.value.cdId

    if (codeId == "" || codeId == null || codeId == undefined) {
        alert('삭제할 코드를 선택하세요.')
    } else {
        if (!confirm('코드ID : ' + codeId + '  해당 코드를 삭제하시겠습니까?')) {

        } else {
            const result = await $fetch<ApiResponse<Data[]>>("/playground/public/code/codeDelete", {
                method: 'POST',
                body: JSON.stringify(deleteData.value)
            });
            alert('삭제되었습니다.')
            codeReset()
        }
    }
};

const insert = async () => {

    prompt.value = true

    let findSn = ''

    //객체 복사 , update시 코드,상위코드 readonly(sn 값이 있으면) 
    if (selected.value !== null) {
        selected.value?.forEach((item) => {
            updateParam.value = { ...item }
            findSn = item.sn
        })
        if (findSn !== '') {
            readonly.value = true
            insertParam.value = updateParam.value

            //상위코드값이 저장되어 있으면 코드 값 보이게 
            if (updateParam.value.upCdId !== '') {
                groupCdCheck.value = true
            }
            else { groupCdCheck.value = false }
        } else {
            readonly.value = false
        }
    }
}


//코드 등록
const insertCode = async () => {

    //ID중복체크
    let findId = ''
    let findUpCdId = ''

    if (insertParam.value !== null) {
        resData.value?.forEach((item) => {
            if (item.cdId == insertParam.value.cdId && item.upCdId == insertParam.value.upCdId) {
                findId = item.cdId
                findUpCdId = item.upCdId
            }
        })
        if (readonly.value != true) {
            // if (insertParam.value.cdId == '' || insertParam.value.cdNm == '' || insertParam.value.sortSn == '') {
            //     alert('필수 항목을 모두 입력해주세요')
            //     return
            // } else {
            if (insertParam.value.cdId == findId && insertParam.value.upCdId == findUpCdId) {
                alert('이미 등록된 코드입니다.')
                return
            }
            else {
                submit()
            }
            // }
        } else {
            //readonly.value = true 일시, cdid 중복 체크 X
            selected.value?.forEach((item) => {
                updateParam.value = { ...item }
            })

            if (updateParam.value.cdNm == insertParam.value.cdNm && updateParam.value.sortSn == insertParam.value.sortSn) {
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
        insertParam.value.groupCdYn = 'N'
        if (insertParam.value.upCdId == '') {
            insertParam.value.groupCdYn = 'Y'
        }
    } else {
        insertParam.value.groupCdYn = 'Y'
        insertParam.value.upCdId = ''
    }

    const result = await $fetch<ApiResponse<Data[]>>("/playground/public/code/codeSave", {
        method: 'POST',
        body: JSON.stringify(insertParam.value)
    });
    alert("등록되었습니다.");
    prompt.value = false
    codeReset()
}




const codeReset = () => {

    groupCdCheck = ref(false);

    selected = ref<Data[]>();


    deleteData.value = {
        cdId: '',
        cdNm: '',
        upCdId: '',
        groupCdYn: '',
        sortSn: '',
        regMbrNo: '',
        mdfcnMbrNo: ''
    }
    insertParam.value = {
        cdId: '',
        cdNm: '',
        upCdId: '',
        groupCdYn: '',
        sortSn: '',
        regMbrNo: '',
        mdfcnMbrNo: ''
    }

    updateParam.value = {
        cdId: '',
        cdNm: '',
        upCdId: '',
        groupCdYn: '',
        sortSn: '',
        regMbrNo: '',
        mdfcnMbrNo: ''
    }
    codeSearch()
    SearchAll()
}

onMounted(() => {
    SearchAll()
    codeSearch()
})

</script>


<style lang="sass">
.my-sticky-header-table
  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th

    background-color: #dcdcdc

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0


  &.q-table--loading thead tr:last-child th

    top: 48px


  tbody
    scroll-margin-top: 48px
</style>
<template>
    <div class="q-pa-md">
        <div class="q-gutter-md row items-start">
            <q-input outlined v-model="param.cdId" label="코드ID" />
            <q-input outlined v-model="param.cdNm" label="코드명" />
            <q-input outlined v-model="param.upCdId" label="상위코드ID" />
            <q-select outlined v-model="param.groupCdYn" :options="groupCdOptions" label="그룹코드여부" style="width: 200px">
                <template v-if="param.groupCdYn" v-slot:append>
                    <q-icon name="cancel" @click.stop.prevent="param.groupCdYn = ''" class="cursor-pointer" />
                </template>
            </q-select>
            <q-btn color="primary" label="Push" @click="codeSearch" value="codeSearch"></q-btn>
        </div>
    </div>

    <div class="q-pa-md">
        <q-btn color="primary" label="Insert" @click="prompt = true" />
        &ensp;
        <q-btn color="primary" label="UpDate" @click="codeUpdate" />
        &ensp;
        <q-btn color="primary" label="Delete" @click="codeDelete" type="reset" />

        <q-table flat bordered title="코드 조회" :rows="resData" row-key="cdId" :columns="columns" selection="single"
            v-model:selected="selected">
        </q-table>

    </div>


    <template>
        <div class="q-pa-md q-gutter-sm">
            <q-dialog v-model="prompt" persistent>
                <q-card style="min-width: 350px">
                    <q-form ref="insertForm" class="q-gutter-md" @submit="onSubmit">
                        <q-card-section>
                            <div class="text-h6">코드 등록</div>
                        </q-card-section>

                        <q-card-section class="q-pt-none">
                            <q-input dense v-model="insertParam.cdId" autofocus label="코드ID" filled
                                :rules="[codeid_rules]" />
                            <q-input dense v-model="insertParam.cdNm" autofocus label="코드명" filled
                                :rules="[codeNm_rules]" />
                            <q-input dense v-model="insertParam.upCdId" autofocus label="상위코드ID" filled
                                :rules="[upCodeid_rules]" />
                            <q-select dense v-model="insertParam.groupCdYn" :options="groupCdOptions" autofocus
                                label="그룹코드여부" filled :rules="[val => !!val || '그룹코드여부를 선택하세요']" />
                            <q-input dense type="number" v-model="insertParam.sortSn" autofocus label="정렬순번" filled
                                :rules="[sortSn_rules]" />
                        </q-card-section>
                        <q-card-actions align="right" class="text-primary">
                            <q-btn flat label="종료" type="reset" v-close-popup @click="codeReset" />
                            <q-btn flat label="등록 " type="submit" />
                        </q-card-actions>
                    </q-form>
                </q-card>
            </q-dialog>
        </div>
    </template>


    <template v-if="prompt2">
        <div class="q-pa-md q-gutter-sm">
            <q-dialog v-model="prompt2" persistent>
                <q-card style="min-width: 350px">
                    <q-form ref="updateForm" class="q-gutter-md" @submit="codeUpdate">
                        <q-card-section>
                            <div class="text-h6">코드 수정</div>
                        </q-card-section>

                        <q-card-section class="q-pt-none" v-for="test in selected">
                            <q-input dense v-model="test.cdId" autofocus label="코드ID" filled :rules="[codeid_rules]" />
                            <q-input dense v-model="test.cdNm" autofocus label="코드명" filled :rules="[codeNm_rules]" />
                            <q-input dense v-model="test.upCdId" autofocus label="상위코드ID" filled
                                :rules="[upCodeid_rules]" />
                            <q-select dense v-model="test.groupCdYn" :options="groupCdOptions" autofocus label="그룹코드여부"
                                filled :rules="[val => !!val || '그룹코드여부를 선택하세요']" />
                            <q-input dense type="number" v-model="test.sortSn" autofocus label="정렬순번" filled
                                :rules="[sortSn_rules]" />
                        </q-card-section>
                        <q-card-actions align="right" class="text-primary">
                            <q-btn flat label="종료" v-close-popup type="reset" @click="codeReset" />
                            <q-btn flat label="등록 " type="submit" @click="codeUpdatebtn" />
                        </q-card-actions>
                    </q-form>
                </q-card>
            </q-dialog>
        </div>
    </template>
</template>


<script setup lang="ts">
import { ref } from 'vue';
import { type ApiPagingResponse } from '../../interface/server';
import { date, type QTableProps } from 'quasar';


const columns = ref<QTableProps["columns"]>([
    { name: 'cdId', align: 'left', label: '코드ID', field: 'cdId', sortable: true },
    { name: 'cdNm', align: 'center', label: '코드명', field: 'cdNm', sortable: true },
    { name: 'upCdId', align: 'center', label: '상위코드ID', field: 'upCdId', sortable: true },
    { name: 'groupCdYn', align: 'center', label: '그룹코드사용여부', field: 'groupCdYn', sortable: true },
    { name: 'sortSn', align: 'center', label: '정렬순번', field: 'sortSn', sortable: true },
    { name: 'regMbrNo', align: 'center', label: '등록자', field: 'regMbrNo', sortable: true },
    { name: 'regDt', align: 'center', label: '등록일시', field: 'regDt', sortable: true },
    { name: 'mdfcnMbrNo', align: 'center', label: '수정자', field: 'mdfcnMbrNo', sortable: true },
    { name: 'dfcnDt', align: 'center', label: '수정일시', field: 'dfcnDt', sortable: true },
])


let insertForm = ref<any>(null);
let updateForm = ref<any>(null);
let prompt = ref(false);
let prompt2 = ref<any>(false);
let resData = ref<Data[]>();
let selected = ref<Data[]>();

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

let updateParam = ref<Search>({
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

const upCodeid_rules = (val: string) => {
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

const sortSn_rules = (val: string) => {
    if (!val) {
        return '정렬순번을 입력해주세요. 숫자만 입력 가능 합니다.';
    }
    return true;
}

//코드 조회
const codeSearch = async () => {

    const result = await $fetch<ApiPagingResponse<Data>>("/playground/public/code/codeSearch", {
        method: 'POST',
        body: JSON.stringify(param.value)
    });
    resData.value = result.data.content;
};


//코드 삭제
const codeDelete = async () => {

    selected.value?.forEach(async (item) => {
        deleteData.value = item
    })

    let codeId = deleteData.value.cdId
    console.log('Delete : ', codeId);

    if (codeId == "" || codeId == null || codeId == undefined) {
        alert('삭제할 코드를 선택하세요.')
    } else {
        if (!confirm('코드ID : ' + codeId + '  해당 코드를 삭제 하시겠습니까?')) {
            codeReset()
        } else {
            const result = await $fetch<ApiPagingResponse<Data>>("/playground/public/code/codeDelete", {
                method: 'POST',
                body: JSON.stringify(deleteData.value)
            });
            alert('삭제')
            codeReset()
        }
    }
};


//코드 등록
const onSubmit = async () => {

    alert("저장되었습니다.");

    const result = await $fetch<ApiPagingResponse<Data>>("/playground/public/code/codeSave", {
        method: 'POST',
        body: JSON.stringify(insertParam.value)
    });
    prompt.value = false
    codeReset()
}

//코드 수정
const codeUpdate = () => {

    prompt2.value = false

    selected.value?.forEach((item) => {
        updateParam.value = item
    })

    let upDateId = updateParam.value.cdId

    console.log('codeId : ', upDateId);

    if (upDateId == "" || upDateId == null || upDateId == undefined) {
        alert('변경할 코드를 선택하세요.')
    } else {
        prompt2.value = true
    }
}

const codeUpdatebtn = () => {

    const result = $fetch<ApiPagingResponse<Data>>("/playground/public/code/codeUpdate", {
        method: 'POST',
        body: JSON.stringify(updateParam.value)
    });
    alert('수정되었습니다.')
    prompt2.value = false
    codeReset()
}


const codeReset = () => {

    updateParam.value = {
        cdId: '',
        cdNm: '',
        upCdId: '',
        groupCdYn: '',
        sortSn: '',
        regMbrNo: '',
        mdfcnMbrNo: ''
    }

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

    codeSearch()

}

</script>

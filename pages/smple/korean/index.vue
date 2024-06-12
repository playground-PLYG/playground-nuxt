<template>
  <div id="q-app">
    <div class="q-pa-md">
      <h6 class="q-my-sm">
        <a href="https://github.com/hyukson/hangul-util" target="_blank"
          >참고 사이트 (https://github.com/hyukson/hangul-util)</a
        >
      </h6>
      <q-layout
        view="lhh LpR lff"
        container
        style="height: 300px"
        class="shadow-2 rounded-borders"
        :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
      >
        <q-page-container>
          <q-page style="padding-top: 60px" class="q-pa-md bg-white">
            <q-page-sticky position="top" expand class="bg-primary text-white">
              <q-toolbar>
                <q-toolbar-title>초성 정규식 매칭</q-toolbar-title>
              </q-toolbar>
            </q-page-sticky>

            <div class="q-pa-md row">
              <div class="col-4">
                <q-input
                  v-model="testStr1_1"
                  outlined
                  label="검색 단어"
                  round
                  dense
                  flat
                  class="input"
                />

                <br />

                <q-input
                  v-model="testStr1_2"
                  outlined
                  label="원본 문장"
                  round
                  dense
                  flat
                  class="input"
                />

                <q-separator inset class="q-my-lg" />

                <p class="test-result" v-html="testStr1_3"></p>
              </div>

              <q-separator inset vertical class="q-mx-lg" />

              <div class="col-7">
                <code-editor
                  class="editor"
                  v-model="testCode1"
                  lang="typescript"
                  :options="editorOptions"
                  :style="{ height: '190px' }"
                />
              </div>
            </div>
          </q-page>
        </q-page-container>
      </q-layout>

      <q-layout
        view="lhh LpR lff"
        container
        style="height: 340px"
        class="q-mt-md shadow-2 rounded-borders"
        :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
      >
        <q-page-container>
          <q-page style="padding-top: 60px" class="q-pa-md bg-white">
            <q-page-sticky position="top" expand class="bg-primary text-white">
              <q-toolbar>
                <q-toolbar-title>숫자 to 한글</q-toolbar-title>
              </q-toolbar>
            </q-page-sticky>

            <div class="q-pa-md row">
              <div class="col-4">
                <q-input
                  v-model="testStr2_1"
                  outlined
                  label="숫자"
                  round
                  dense
                  flat
                  type="number"
                  class="input"
                />

                <q-separator inset class="q-my-lg" />

                <p class="test-result">
                  단위만 한글
                  <br />
                  {{ testStr2_2 }}
                  <br />
                  <br />
                  전체 한글
                  <br />
                  {{ testStr2_3 }}
                </p>
              </div>

              <q-separator inset vertical class="q-mx-lg" />

              <div class="col-7">
                <code-editor
                  class="editor"
                  v-model="testCode2"
                  lang="typescript"
                  :options="editorOptions"
                  :style="{ height: '230px' }"
                />
              </div>
            </div>
          </q-page>
        </q-page-container>
      </q-layout>

      <q-layout
        view="lhh LpR lff"
        container
        style="height: 320px"
        class="q-mt-md shadow-2 rounded-borders"
        :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
      >
        <q-page-container>
          <q-page style="padding-top: 60px" class="q-pa-md bg-white">
            <q-page-sticky position="top" expand class="bg-primary text-white">
              <q-toolbar>
                <q-toolbar-title>날짜 포맷</q-toolbar-title>
              </q-toolbar>
            </q-page-sticky>

            <div class="q-pa-md row">
              <div class="col-4">
                <q-input
                  v-model="testStr3_1"
                  outlined
                  label="날짜"
                  round
                  dense
                  flat
                  type="datetime-local"
                  class="input"
                />

                <br />

                <q-input
                  v-model="testStr3_2"
                  outlined
                  label="포맷"
                  round
                  dense
                  flat
                  class="input"
                />

                <q-separator inset class="q-my-lg" />

                <p class="test-result">
                  {{ testStr3_3 }}
                </p>
              </div>

              <q-separator inset vertical class="q-mx-lg" />

              <div class="col-7">
                <code-editor
                  class="editor"
                  v-model="testCode3"
                  lang="typescript"
                  :options="editorOptions"
                  :style="{ height: '180px' }"
                />
              </div>
            </div>
          </q-page>
        </q-page-container>
      </q-layout>

      <q-layout
        view="lhh LpR lff"
        container
        style="height: 460px"
        class="q-mt-md shadow-2 rounded-borders"
        :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
      >
        <q-page-container>
          <q-page style="padding-top: 60px" class="q-pa-md bg-white">
            <q-page-sticky position="top" expand class="bg-primary text-white">
              <q-toolbar>
                <q-toolbar-title>문자 배열 조건 정렬</q-toolbar-title>
              </q-toolbar>
            </q-page-sticky>

            <div class="q-pa-md row">
              <div class="col-4">
                <p class="test-result">
                  기준
                  <br />
                  <div class="row">
                    <span v-for="(txt, index) in testStr4_1" :key="index" style="width: 53px;">
                      <q-input
                        v-model="testStr4_1[index]"
                        outlined
                        round
                        dense
                        flat
                        class="input col-1"
                      />
                    </span>
                  </div>

                  <br />
                  <br />
                  정렬 전
                  <br />
                  <div class="row">
                    <span v-for="(txt, index) in testStr4_2" :key="index" style="width: 53px;">
                      <q-input
                        v-model="testStr4_2[index]"
                        outlined
                        round
                        dense
                        flat
                        class="input col-1"
                      />
                    </span>
                  </div>

                  <br />
                  <br />
                  정렬 후
                  <br />
                  {{ testStr4_3 }}
                </p>
              </div>

              <q-separator inset vertical class="q-mx-lg" />

              <div class="col-7">
                <code-editor
                  class="editor"
                  v-model="testCode4"
                  lang="typescript"
                  :options="editorOptions"
                  :style="{ height: '180px' }"
                />
              </div>
            </div>
          </q-page>
        </q-page-container>
      </q-layout>

      <q-layout
        view="lhh LpR lff"
        container
        style="height: 320px"
        class="q-mt-md shadow-2 rounded-borders"
        :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
      >
        <q-page-container>
          <q-page style="padding-top: 60px" class="q-pa-md bg-white">
            <q-page-sticky position="top" expand class="bg-primary text-white">
              <q-toolbar>
                <q-toolbar-title>조사 포맷</q-toolbar-title>
              </q-toolbar>
            </q-page-sticky>

            <div class="q-pa-md row">
              <div class="col-4">
                <q-input
                  v-model="testStr5_1"
                  outlined
                  label="단어 1"
                  round
                  dense
                  flat
                  class="input"
                />

                <br />

                <q-input
                  v-model="testStr5_2"
                  outlined
                  label="단어 1"
                  round
                  dense
                  flat
                  class="input"
                />

                <q-separator inset class="q-my-lg" />

                <p class="test-result">
                  {{ testStr5_1 }} => {{ testStr5_3 }}
                  <br />
                  {{ testStr5_2 }} => {{ testStr5_4 }}
                </p>
              </div>

              <q-separator inset vertical class="q-mx-lg" />

              <div class="col-7">
                <code-editor
                  class="editor"
                  v-model="testCode5"
                  lang="typescript"
                  :options="editorOptions"
                  :style="{ height: '180px' }"
                />
              </div>
            </div>
          </q-page>
        </q-page-container>
      </q-layout>

      <q-layout
        view="lhh LpR lff"
        container
        style="height: 320px"
        class="q-mt-md shadow-2 rounded-borders"
        :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
      >
        <q-page-container>
          <q-page style="padding-top: 60px" class="q-pa-md bg-white">
            <q-page-sticky position="top" expand class="bg-primary text-white">
              <q-toolbar>
                <q-toolbar-title>올바른 조사 조회</q-toolbar-title>
              </q-toolbar>
            </q-page-sticky>

            <div class="q-pa-md row">
              <div class="col-4">
                <q-input
                  v-model="testStr6_1"
                  outlined
                  label="단어"
                  round
                  dense
                  flat
                  class="input"
                />

                <br />

                <q-input
                  v-model="testStr6_2"
                  outlined
                  label="조사"
                  round
                  dense
                  flat
                  class="input"
                />

                <q-separator inset class="q-my-lg" />

                <p class="test-result">
                  {{ testStr6_3 }}
                </p>
              </div>

              <q-separator inset vertical class="q-mx-lg" />

              <div class="col-7">
                <code-editor
                  class="editor"
                  v-model="testCode6"
                  lang="typescript"
                  :options="editorOptions"
                  :style="{ height: '180px' }"
                />
              </div>
            </div>
          </q-page>
        </q-page-container>
      </q-layout>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import {
  makeRegexByCho,
  formatNumber,
  formatNumberAll,
  formatDate,
  sortByGroups,
  formatJosa,
  josa
} from 'hangul-util'

const editorOptions = ref({
  theme: 'vs-dark',
  folding: true,
  colorDecorators: true,
  minimap: {
    enabled: false,
    renderCharacters: true,
    showSlider: 'always',
    side: 'right'
  },
  guides: {
    bracketPairs: true,
    bracketPairsHorizontal: true,
    highlightActiveBracketPair: true,
    highlightActiveIndentation: true,
    indentation: true
  },
  readOnly: true
})

// 초성 정규식 매칭 - start
const testStr1_1 = ref<string>('ㅅㄱ')
const testStr1_2 = ref<string>('바나나사과수박복숭아')
const testStr1_3 = ref<string>(
  testStr1_2.value.replace(makeRegexByCho(testStr1_1.value), '<mark>$1</mark>')
)
const testCode1 = ref<string>(`import { makeRegexByCho } from 'hangul-util'

/**
 * makeRegexByCho(search?: string): RegExp
 */
const regex = makeRegexByCho('${testStr1_1.value}')
'${testStr1_2.value}'.replace(regex, '<mark>$1</mark>')`)

watch(testStr1_1, (newVal) => {
  const regex = makeRegexByCho(newVal)

  testStr1_3.value = testStr1_2.value.replace(regex, '<mark>$1</mark>')
})
// 초성 정규식 매칭 - end

// 숫자 to 한글 - start
const testStr2_1 = ref<string>(123456)
const testStr2_2 = ref<string>(formatNumber(testStr2_1.value))
const testStr2_3 = ref<string>(formatNumberAll(testStr2_1.value))
const testCode2 = ref<string>(`import { formatDate } from 'hangul-util'

/**
 * formatNumberAll(format?: number | string | null): string
 */
formatNumber(${testStr2_1.value})

/**
 * formatNumberAll(format?: number | string | null): string
 */
formatNumberAll(${testStr2_1.value})`)

watch(testStr2_1, (newVal) => {
  testStr2_2.value = formatNumber(testStr2_1.value)
  testStr2_3.value = formatNumberAll(testStr2_1.value)
})
// 숫자 to 한글 - end

// 날짜 포맷 - start
const testStr3_1 = ref<date>(new Date())
const testStr3_2 = ref<string>('YYYY년 MM월 DD일 (dd) HH시 mm분 ss초')
const testStr3_3 = ref<string>(formatDate(testStr3_1.value, testStr3_2.value))
const testCode3 = ref<string>(`import { formatDate } from 'hangul-util'

/**
 * formatDate(_date?: string | Date, formatStyle?: string): string
 */
formatNumber(new Date())

formatDate(new Date(), '${testStr3_2.value}')`)

watch([testStr3_1, testStr3_2], (newVal) => {
  testStr3_3.value = formatDate(testStr3_1.value, testStr3_2.value)
})
// 날짜 포맷 - end

// 문자 배열 조건 정렬 - start
const testStr4_1 = ref<string[]>(['사장', '부장', '대리', '사원'])
const testStr4_2 = ref<string[]>(['대리', '사원', '사장', '부장'])
const testStr4_3 = ref<string[]>(
  sortByGroups(testStr4_2.value, testStr4_1.value)
)
const testCode4 = ref<string>(`import { sortByGroups } from 'hangul-util'

/**
 * sortByGroups(array?: any[], groups?: (number | string)[], orderASC?: boolean, compare?: string): any[]
 */
sortByGroups(['${testStr4_2.value.join('\', \'')}'], ['${testStr4_1.value.join('\', \'')}'])`)

watch([testStr4_1, testStr4_2], (a) => {
  testStr4_3.value = sortByGroups(testStr4_2.value, testStr4_1.value)

  testCode4.value = `import { sortByGroups } from 'hangul-util'

/**
 * sortByGroups(array?: any[], groups?: (number | string)[], orderASC?: boolean, compare?: string): any[]
 */
sortByGroups(['${testStr4_2.value.join('\', \'')}'], ['${testStr4_1.value.join('\', \'')}'])`
}, {deep: true})
// 문자 배열 조건 정렬 - end

// 조사 포맷 - start
const testStr5_1 = ref<string>('사진[을/를]')
const testStr5_2 = ref<string>('티비[을/를]')
const testStr5_3 = ref<string>(formatJosa(testStr5_1.value))
const testStr5_4 = ref<string>(formatJosa(testStr5_2.value))
const testCode5 = ref<string>(`import { formatJosa } from 'hangul-util'

/**
 * formatJosa(letter?: string): string
 */
formatJosa('${testStr5_1.value}')

formatJosa('${testStr5_2.value}')`)

watch([testStr5_1, testStr5_2], () => {
  testStr5_3.value = formatJosa(testStr5_1.value)
  testStr5_4.value = formatJosa(testStr5_2.value)

  testCode5.value = `import { formatJosa } from 'hangul-util'

/**
 * formatJosa(letter?: string): string
 */
formatJosa('${testStr5_1.value}')

formatJosa('${testStr5_2.value}')`
})
// 조사 포맷 - end

// 올바른 조사 조회 - start
const testStr6_1 = ref<string>('인생')
const testStr6_2 = ref<string>('를')
const testStr6_3 = ref<string>(josa(testStr6_1.value, testStr6_2.value))
const testCode6 = ref<string>(`import { josa } from 'hangul-util'

/**
 * josa(letter?: string, _josa?: string): string
 */
josa('${testStr6_1.value}', '${testStr6_2.value}')`)

watch([testStr6_1, testStr6_2], () => {
  testStr6_3.value = josa(testStr6_1.value, testStr6_2.value)

  testCode6.value = `import { josa } from 'hangul-util'

/**
 * josa(letter?: string, _josa?: string): string
 */
josa('${testStr6_1.value}', '${testStr6_2.value}')`
})
// 올바른 조사 조회 - end
</script>

<style lang="scss" scoped>
.editor {
  border: 1px solid lightgrey;
}
</style>

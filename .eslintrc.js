module.exports = {
    // 프로젝트의 루트 디렉토리에서 .eslintrc.js 파일을 찾음
    root: true,
    env: {
        // 코드가 실행되는 환경 설정
        browser: true, // 브라우저 환경에서 실행
        node: true // 노드 환경에서 실행
    },
    parser: 'vue-eslint-parser', // Vue.js 코드를 분석할 때 사용할 파서 지정
    // 파서에 대한 옵션 설정
    parserOptions: {
        parser: '@typescript-eslint/parser', // TypeScript 코드를 파싱하는 데 사용할 파서 지정
        sourceType: 'module' // ECMAScript 모듈 형식으로 코드 작성
    },
    // 사용할 ESLint 플러그인 목록 - Typescript
    plugins: ['@typescript-eslint', 'vue'],
    // 사용할 ESLint 확장 구성 목록
    extends: [
        'airbnb-base', // airbnb에서 사용하는 JavaScript 스타일 가이드
        'eslint:recommended', // ESLint에서 권장하는 기본 규칙
        'plugin:nuxt/recommended', // Nuxt.js 관련 규칙
        'plugin:vue/recommended', // Vue.js 관련 규칙
        'plugin:prettier/recommended', // Prettier와 ESLint의 충돌을 방지하기 위한 규칙
        'plugin:@typescript-eslint/eslint-recommended', // TypeScript ESLint 규칙
        '@nuxtjs/eslint-config-typescript' // Nuxt.js 프로젝트에서 TypeScript와 함께 사용되는 ESLint 규칙
    ],
    rules: {
        // 사용자 정의 규칙 설정
        'import/extensions': 'off', // 파일 확장자를 명시적으로 지정하지 않아도 되도록 함
        'import/no-unresolved': 'off', // 해결할 수 없는 import 경로에 대한 경고 무시
        'import/no-extraneous-dependencies': 'off', // package.json에 없는 패키지를 import할 때 에러 무시
        'import/prefer-default-export': 'off', // 단일 export가 아니어도 되도록 함
        'vue/multi-word-component-names': 'off', // Vue 컴포넌트 이름에 대한 규칙 완화
        'no-shadow': 0, // 변수명 중복 사용을 허용
        '@typescript-eslint/no-shadow': 'error', // TypeScript에서 변수명 중복 사용 에러
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off', // 프로덕션 환경에서 콘솔 사용 금지
        'no-debug': process.env.NODE_ENV === 'production' ? 'error' : 'off', // 프로덕션 환경에서 디버그 관련 문제 발생 시 에러
        'no-unused-vars': 'off', // 사용되지 않는 변수에 대한 경고 무시
        // Prettier 코드 스타일 설정
        'prettier/prettier': [
            'error',
            {
                arrowSpacing: ['error', { before: true, after: true }], // 화살표 함수의 스페이싱 설정
                singleQuote: true, // 작은따옴표 사용
                semi: false, // 세미콜론 사용하지 않음
                useTabs: false, // 탭 대신 스페이스 사용
                tabWidth: 2, // 탭의 너비
                trailingComma: 'none', // 후행 콤마 사용하지 않음
                printWidth: 80, // 한 줄의 최대 길이
                bracketSpacing: true, // 객체 리터럴의 괄호 사이에 공백 사용
                arrowParens: 'always', // 화살표 함수의 매개변수 괄호 사용
                endOfLine: 'auto' // 플랫폼에 맞게 개행문자 설정
            }
        ],
        'global-require': 0 // require로 이미지 경로를 지정할 때 발생하는 에러 무시
    }
}

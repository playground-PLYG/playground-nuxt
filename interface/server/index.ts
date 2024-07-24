import type { MultiWatchSources } from '@vueuse/core'
import type { Ref } from 'vue'

export interface IFetchOptions {
  method: string
  body?: object
  params?: object
  query?: object
  headers?: HeadersInit
  watch?: MultiWatchSources
}

/**
 * Api 호출 후 BaseResponse 구조
 *
 * @typedef ApiResponse<Type>
 *
 * @property {string} result "SUCCESS"|"FAIL"
 * @property {string} resultCode 성공(0000), 공통에러(9999), 그외...
 * @property {string} errorMessage 에러 발생 시 에러 메시지 (optional)
 * @property {Type} data api 결과 데이터
 */
export interface ApiResponse<Type> {
  result: string
  resultCode: string
  errorMessage?: string
  data: Type
}

/**
 * Api 호출 후 페이징 처리된 BaseResponse 구조
 *
 * @typedef ApiResponse<Type>
 *
 * @property {string} result "SUCCESS"|"FAIL"
 * @property {string} errorMessage 에러 발생 시 에러 메시지 (optional)
 * @property {PageListInfo} data 페이징 처리 된 api 결과 데이터
 */
export interface ApiPagingResponse<Type> {
  result: string
  data: PageListInfo<Type>
}

/**
 * 페이징 정보 구조
 *
 * @typedef Page
 *
 * @property {object} pageable pageable 객체
 * @property {object} pageable.sort 정렬 객체
 * @property {boolean} pageable.sort.empty 정렬 빈값 여부
 * @property {boolean} pageable.sort.unsorted 정렬 미적용 여부
 * @property {boolean} pageable.sort.sorted 정렬 적용 여부
 * @property {number} pageable.offset ?
 * @property {number} pageable.pageNumber 페이지 번호 (zero base)
 * @property {number} pageable.pageSize 한 페이지당 row 수
 * @property {boolean} pageable.unpaged 페이징 미적용여부
 * @property {boolean} pageable.paged 페이징 적용여부
 *
 * @property {object} sort 정렬
 * @property {boolean} sort.empty 빈값여부
 * @property {boolean} sort.unsorted 미적용 여부
 * @property {boolean} sort.sorted 적용 여부
 *
 * @property {number} totalElements 전체 row 수
 * @property {boolean} last 마지막 페이지 여부
 * @property {number} totalPages 총 페이지 수
 * @property {number} size 한 페이지당 row 수
 * @property {number} number 현재 페이지 번호
 * @property {number} numberOfElements 현재 페이지 row 수
 * @property {boolean} first 첫 페이지 여부
 * @property {boolean} empty 현재 결과 비어있는지 여부
 */
export interface Page {
  readonly pageable: {
    sort: {
      empty: boolean
      unsorted: boolean
      sorted: boolean
    }
    offset: number
    pageNumber: number
    pageSize: number
    unpaged: boolean
    paged: boolean
  }
  readonly totalElements: number
  readonly last: boolean
  readonly totalPages: number
  readonly size: number
  readonly number: number
  readonly sort: {
    empty: boolean
    unsorted: boolean
    sorted: boolean
  }
  readonly numberOfElements: number
  readonly first: boolean
  readonly empty: boolean
}

/**
 * 페이징 처리 결과 구조
 *
 * @typedef ApiResponse<Type>
 *
 * @property {Array<Type>} content 페이징 처리 된 데이터 목록
 *
 * @property {object} pageable pageable 객체
 * @property {object} pageable.sort 정렬 객체
 * @property {boolean} pageable.sort.empty 정렬 빈값 여부
 * @property {boolean} pageable.sort.unsorted 정렬 미적용 여부
 * @property {boolean} pageable.sort.sorted 정렬 적용 여부
 * @property {number} pageable.offset ?
 * @property {number} pageable.pageNumber 페이지 번호 (zero base)
 * @property {number} pageable.pageSize 한 페이지당 row 수
 * @property {boolean} pageable.unpaged 페이징 미적용여부
 * @property {boolean} pageable.paged 페이징 적용여부
 *
 * @property {object} sort 정렬
 * @property {boolean} sort.empty 빈값여부
 * @property {boolean} sort.unsorted 미적용 여부
 * @property {boolean} sort.sorted 적용 여부
 *
 * @property {number} totalElements 전체 row 수
 * @property {boolean} last 마지막 페이지 여부
 * @property {number} totalPages 총 페이지 수
 * @property {number} size 한 페이지당 row 수
 * @property {number} number 현재 페이지 번호
 * @property {number} numberOfElements 현재 페이지 row 수
 * @property {boolean} first 첫 페이지 여부
 * @property {boolean} empty 현재 결과 비어있는지 여부
 */
export interface PageListInfo<Type> extends Page {
  content: Array<Type>
}

/**
 * 페이징 처리를 위한 페이지 정보 request 구조
 *
 * @typedef RequestPage
 *
 * @property {string} page 조회 할 페이지
 * @property {string} size 한 페이지당 표시될 row 수
 * @property {string} sort 정렬
 */
/*
export interface RequestPage extends Record<string, string> {
    page?: string
    size?: string
    sort?: string
}
*/

/**
 * SEO를 위한 Metadata 구조
 *
 * @typedef Metadata
 *
 */
export interface Metadata {
  url: string
  title: string
  description: string
  category: string
  keywords: string[]
  ogTitle: string
  ogDescription: string
  ogUrl: string
  ogSiteName: string
  ogImages: string[]
  metadataBase: string
  icon: string
  apple: string
}

/**
 * Code
 *
 * @typedef Code
 *
 * @property {string} code 코드
 * @property {string} codeName 코드명
 * @property {string} upperCode 상위코드
 * @property {string} order 정렬순서
 */
export interface Code {
  code: string
  codeName: string
  upperCode: string
  order: number
}

/**
 * FileInfo
 *
 * @typedef FileInfo
 *
 * @property {string} fileId 파일ID
 * @property {string} fileSize 파일용량(byte)
 * @property {string} fileName 파일명
 */
export interface FileInfo {
  fileId: string
  fileSize: number
  fileName: string
}

export interface PwaInjection {
  /**
   * @deprecated use `isPWAInstalled` instead
   */
  isInstalled: boolean
  /**
   * From version v0.3.5+. 
   */
  isPWAInstalled: Ref<boolean>
  showInstallPrompt: Ref<boolean>
  cancelInstall: () => void
  install: () => Promise<void>
  swActivated: Ref<boolean>
  registrationError: Ref<boolean>
  offlineReady: Ref<boolean>
  needRefresh: Ref<boolean>
  updateServiceWorker: (reloadPage?: boolean | undefined) => Promise<void>
  cancelPrompt: () => Promise<void>
  getSWRegistration: () => ServiceWorkerRegistration | undefined
}


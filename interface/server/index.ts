import { type MultiWatchSources } from 'nuxt/dist/app/composables/asyncData'

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
 * @prop {string} result "SUCCESS"|"FAIL"
 * @prop {string} errorMessage 에러 발생 시 에러 메시지 (optional)
 * @prop {Type} data api 결과 데이터
 */
export interface ApiResponse<Type> {
    result: string
    errorMessage?: string
    data: Type
}

/**
 * Api 호출 후 페이징 처리된 BaseResponse 구조
 *
 * @typedef ApiResponse<Type>
 *
 * @prop {string} result "SUCCESS"|"FAIL"
 * @prop {string} errorMessage 에러 발생 시 에러 메시지 (optional)
 * @prop {PageListInfo} data 페이징 처리 된 api 결과 데이터
 */
export interface ApiPagingResponse<Type> {
    result: string
    data: PageListInfo<Type>
}

/**
 * 페이징 처리 결과 구조
 *
 * @typedef ApiResponse<Type>
 *
 * @prop {Array<Type>} content 페이징 처리 된 데이터 목록
 *
 * @prop {object} pageable pageable 객체
 * @prop {object} pageable.sort 정렬 객체
 * @prop {boolean} pageable.sort.empty
 * @prop {boolean} pageable.sort.unsorted 정렬 미적용 여부
 * @prop {boolean} pageable.sort.sorted 정렬 적용 여부
 * @prop {number} pageable.offset ?
 * @prop {number} pageable.pageNumber 페이지 번호 (zero base)
 * @prop {number} pageable.pageSize 한 페이지당 row 수
 * @prop {boolean} pageable.unpaged
 * @prop {boolean} pageable.paged
 *
 * @prop {object} sort
 * @prop {boolean} sort.empty
 * @prop {boolean} sort.unsorted
 * @prop {boolean} sort.sorted
 *
 * @prop {number} totalElements 전체 row 수
 * @prop {boolean} last 마지막 페이지 여부
 * @prop {number} totalPages 총 페이지 수
 * @prop {number} size 한 페이지당 row 수
 * @prop {number} number 현재 페이지 번호
 * @prop {number} numberOfElements 현재 페이지 row 수
 * @prop {boolean} first 첫 페이지 여부
 * @prop {boolean} empty 현재 결과 비어있는지 여부
 */
export interface PageListInfo<Type> {
    content: Array<Type>
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
 * 페이징 처리를 위한 페이지 정보 request 구조
 *
 * @typedef RequestPage
 *
 * @prop {string} page 조회 할 페이지
 * @prop {string} size 한 페이지당 표시될 row 수
 * @prop {string} sort 정렬
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

export interface Code {
    code: string
    codeName: string
    upperCode: string
    order: number
}
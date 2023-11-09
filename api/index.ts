import { type IFetchOptions, type ApiResponse } from '~/interface/server'

export default class ApiService {
    private static async fetch<T>(
        url: string,
        fetchOptions: IFetchOptions
    ): Promise<ApiResponse<T>> {
    const optionsInit = {
        ...fetchOptions,
        initialCache: false,
        headers: { ...fetchOptions.headers }
    }

    const getToken = useCookie('token')

    if (getToken.value) {
        optionsInit.headers = {
        ...optionsInit.headers,
        Authorization: `Bearer ${getToken.value}`
        }
    }

    return new Promise((resolve, reject) => {
        useFetch(url, {
        onRequest({ options }) {
            Object.assign(options, optionsInit)
        },
        onRequestError({ error }) {},
        async onResponse({ request, response, options }) {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            const { status, _data } = response

            if (status === 200) {
            console.log('response', status)
            resolve(_data)
            }
        },
        onResponseError({ response }) {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            const { status, _data } = response

            console.log('responseError')
            reject(_data)
        },
        watch: fetchOptions.watch
        })
    })
    }

    // GET 메서드
    public async GET<T>(url: string, params?: any, watchData?: any) {
    const data = await ApiService.fetch<T>(url, {
        method: 'GET',
        params,
        watch: [watchData]
    })

    return data
    }

    // POST 메서드
    public async POST<T>(url: string, body?: any, watchData?: any) {
    const headers: HeadersInit = {
        'Content-Type': 'application/json'
    }
    const data = await ApiService.fetch<T>(url, {
        method: 'POST',
        headers,
        body,
        watch: [watchData]
    })

    return data
    }

    // PUT 메서드
    public async PUT<T>(url: string, body?: any, watchData?: any) {
    const headers: HeadersInit = {
        'Content-Type': 'application/json'
    }
    const data = await ApiService.fetch<T>(url, {
        method: 'PUT',
        headers,
        body,
        watch: [watchData]
    })

    return data
    }

    // DELETE 메서드
    public async DELETE<T>(url: string) {
    const data = await ApiService.fetch<T>(url, {
        method: 'DELETE'
    })

    return data
    }

    // FormData
    public async PostFormData<T>(url: string, formData: FormData) {
    const headers: HeadersInit = {
        'Content-Type': 'multipart/form-data'
    }
    const data = await ApiService.fetch<T>(url, {
        method: 'POST',
        headers,
        body: formData
    })

    return data
    }
}​

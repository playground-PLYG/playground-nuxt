import { type ApiResponse, type Code } from '../interface/server';

export const codeUtil = {
  getCode: async (upperCode: string, code: string): Promise<Code> => {
    let resultCode: Code = {
      code: '',
      codeName: '',
      upperCode: '',
      order: -1
    };

    await $fetch<ApiResponse<Code>>(
      '/playground/public/code/getCode',
      {
        method: 'POST',
        body: JSON.stringify({ upperCode, code })
      })
      .then((result) => {
        resultCode = result.data
      })
      .catch((error) => {
        console.error(error)
      })

    return resultCode
  },
  getCodeName: async (upperCode: string, code: string): Promise<string> => {
    let codeName: string = "";

    const resultCode: Code = await codeUtil.getCode(upperCode, code)

    if (resultCode?.codeName) {
      codeName = resultCode.codeName
    }

    return codeName
  },
  getCodeGroupList: async (upperCode: string): Promise<Code[]> => {
    let codeList: Code[] = [];

    await $fetch<ApiResponse<Code[]>>(
      '/playground/public/code/getCodeGroupList',
      {
        method: 'POST',
        body: JSON.stringify({ upperCode })
      })
      .then((result) => {
        codeList = result.data
      })
      .catch((error) => {
        console.error(error)
      })

    return codeList
  }
}
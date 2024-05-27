import { type ApiResponse, type Code } from '../interface/server';
import { useQuasar } from 'quasar';

export const codeUtil = {
  getCode: async (upperCode: string, code: string): Promise<Code> => {
    const { loading } = useQuasar();

    let resultCode: Code = {
      code: '',
      codeName: '',
      upperCode: '',
      order: -1
    };
  
    loading.show()
  
    await $fetch<ApiResponse<Code>>(
    '/playground/public/code/getCode',
    {
      method: 'POST',
      body: JSON.stringify({upperCode, code})
    })
    .then((result) => {
      resultCode = result.data
    })
    .catch((error) => {
      console.error(error)
    })
  
    loading.hide()
  
    return resultCode
  },
  getCodeName: async (upperCode: string, code: string): Promise<string> => {
    const { loading } = useQuasar();

    let codeName: string = "";
    
    let resultCode:Code = await codeUtil.getCode(upperCode, code)

    if (resultCode?.codeName) {
      codeName = resultCode.codeName
    }
  
    return resultCode.codeName
  },
  getCodeGroupList: async (upperCode: string): Promise<Code[]> => {
    const { loading } = useQuasar();

    let codeList: Code[] = [];
  
    loading.show()
  
    await $fetch<ApiResponse<Code[]>>(
    '/playground/public/code/getCodeGroupList',
    {
      method: 'POST',
      body: JSON.stringify({upperCode})
    })
    .then((result) => {
      codeList = result.data
    })
    .catch((error) => {
      console.error(error)
    })
  
    loading.hide()
  
    return codeList
  }
}
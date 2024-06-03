import { useRuntimeConfig } from "nuxt/app"

export const imageUtil = {
  getImageUrl: (fileId: number): string => {
    const config = useRuntimeConfig()

    return `${config.public.apiBaseUrl}/playground/public/file/getImage/${fileId}`
  }
}
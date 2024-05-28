import { inject } from '@vercel/analytics'
import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  inject()
})

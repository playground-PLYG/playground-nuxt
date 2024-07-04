import { Dialog } from 'quasar'

/**
 * commUtil.alert 파라메터 구조
 *
 * @typedef DkAlertType
 *
 * @property {string?} title alert 타이틀 (optional)
 * @property {string} message alert 메시지
 * @property {Function?} callbackFn 확인버튼 선택 시 호출 될 callback (optional)
 */
interface DkAlertType {
  title?: string
  message: string
  callbackFn?: () => void
}

/**
 * commUtil.alertSync 파라메터 구조
 *
 * @typedef DkAlertSyncType
 *
 * @property {string?} title alert 타이틀 (optional)
 * @property {string} message alert 메시지
 */
interface DkAlertSyncType {
  title?: string
  message: string
}

/**
 * commUtil.confirm 파라메터 구조
 *
 * @typedef DkConfirmType
 *
 * @property {string?} title confirm 타이틀 (optional)
 * @property {string} message confirm 메시지
 * @property {Function?} callbackFn 확인버튼 선택 시 호출 될 callback. callback함수의 첫번쨰 파라메터로 확인(true)/취소(false) 값 반환
 */
interface DkConfirmType {
  title?: string
  message: string
  callbackFn?: (isConfirm: boolean) => void
}

/**
 * commUtil.confirmSync 파라메터 구조
 *
 * @typedef DkConfirmSyncType
 *
 * @property {string?} title confirm 타이틀 (optional)
 * @property {string} message confirm 메시지
 */
interface DkConfirmType {
  title?: string
  message: string
  callbackFn?: (isConfirm: boolean) => void
}

export const commUtil = {
  alert: (options: DkAlertType): void => {
    Dialog.create({
      persistent: true,
      title: options.title ?? '알림',
      message: options.message
    }).onOk(() => {
      options.callbackFn?.()
    })
  },
  alertSync: (options: DkAlertSyncType): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      Dialog.create({
        persistent: true,
        title: options.title ?? '알림',
        message: options.message
      }).onOk(() => {
        resolve(true)
      })
    })
  },
  confirm: (options: DkConfirmType): void => {
    Dialog.create({
      persistent: true,
      cancel: true,
      title: options.title ?? '확인',
      message: options.message
    }).onOk(() => {
      options.callbackFn?.(true)
    }).onCancel(() => {
      options.callbackFn?.(false)
    })
  },
  confirmSync: (options: DkConfirmType): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      Dialog.create({
        persistent: true,
        cancel: true,
        title: options.title ?? '확인',
        message: options.message
      }).onOk(() => {
        resolve(true)
      }).onCancel(() => {
        resolve(false)
      })
    })
  }
}
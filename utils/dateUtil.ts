import { type UnitTypeShort } from 'dayjs'
const dayjs = useDayjs()

export const dateUtil = {
  /*
   * description: Date 형을 yyyyMMdd String으로 반환
   * ex)
   * dateUtil.getYmd() -> 20240528
   */
  getYmd: (): string => {
    const formatDate = dayjs(new Date())
    return formatDate.format('YYYYMMDD')
  },
  /*
   * description: Date 타입을 format된 string으로 변환
   * ex)
   * dateUtil.getformatDate(new Date(),"YYYY-MM-DD") -> 2024-05-28
   * dateUtil.getformatDate(new Date(),"YYYY.MM.DD") -> 2024.05.28
   * dateUtil.getformatDate(new Date(),"YYYY/MM/DD") -> 2024/05/28
   * dateUtil.getformatDate(new Date(),"YYYY년 MM월 DD일") -> 2024년 05월 28일
   * dateUtil.getformatDate(new Date(),"YYYY-MM-DD HH:mm:ss")) -> 2024-05-28 15:15:31
   */
  getformatDate: (date: Date, format: string): string => {
    const formatDate = dayjs(date)
    return formatDate.format(format)
  },
  /*
   * description: string 타입을 format string으로 변환
   * ex)
   * dateUtil.getformatString("20240528151531","YYYY-MM-DD") -> 2024-05-28
   * dateUtil.getformatString("20240528151531","YYYY.MM.DD") -> 2024.05.28
   * dateUtil.getformatString("20240528151531","YYYY/MM/DD") -> 2024/05/28
   * dateUtil.getformatString("20240528151531","YYYY년 MM월 DD일") -> 2024년 05월 28일
   * dateUtil.getformatString("20240528151531","YYYY-MM-DD HH:mm:ss")) -> 2024-05-28 15:15:31
   */
  getformatString: (date: string, format: string): string => {
    const formatDate = dayjs(date)
    return formatDate.format(format)
  },
  /*
   * description: 년을 더한 Date 형태를 반환한다.
   * ex)
   * dateUtil.addYear(new Date(),3) -> Fri May 28 2027 15:25:25 GMT+0900 (한국 표준시)
   * dateUtil.addYear(new Date(),-3) -> Fri May 28 2024 15:25:25 GMT+0900 (한국 표준시)
   */
  addYear: (date: Date, val: number): Date => {
    const _date = dayjs(date)

    return _date.add(val, 'year').toDate()
  },
  /*
   * description: 월을 더한 Date 형태를 반환한다.
   * ex)
   * dateUtil.addMonth(new Date(),3) -> Wed Aug 28 2024 15:29:54 GMT+0900 (한국 표준시)
   * dateUtil.addMonth(new Date(),-3) -> Wed Feb 28 2024 15:29:54 GMT+0900 (한국 표준시)
   */
  addMonth: (date: Date, val: number): Date => {
    //
    const _date = dayjs(date)

    return _date.add(val, 'month').toDate()
  },
  /*
   * description: 일을 더한 Date 형태를 반환한다.
   * ex)
   * dateUtil.addDay(new Date(),30) -> Thu Jun 27 2024 15:31:43 GMT+0900 (한국 표준시)
   * dateUtil.addDay(new Date(),-30) -> Sun Apr 28 2024 15:31:43 GMT+0900 (한국 표준시)
   */
  addDay: (date: Date, val: number): Date => {
    const _date = dayjs(date)

    return _date.add(val, 'day').toDate()
  },
  /*
   * description: 인자로 받은 2날짜의 차이나는 일 수를 반환한다.
   * delimiter case
   *  1. "y" -> 년도의 차이
   *  2. "M" -> 월의 차이
   *  3. "d" -> 일의 차이
   *  4. "w" -> 주의 차이
   *  5. "h" -> 시의 차이
   *  5. "m" -> 분의 차이
   *  5. "s" -> 초의 차이
   */
  getDiffDate: (
    dateDiff1: Date,
    dateDiff2: Date,
    delimiter: UnitTypeShort
  ): number => {
    const _date1 = dayjs(dateDiff1)
    const _date2 = dayjs(dateDiff2)

    return Math.ceil(Math.abs(_date1.diff(_date2, delimiter, true)))
  },
  getStringToDateTime: (val: string): string => {
    const _date = dayjs(val)

    return _date.format('YYYY-MM-DDTHH:mm:ss')
  }
}

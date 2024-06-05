export const fileUtil = {
  getFileNameExt(fileName: string): string {
    return fileName.slice(fileName.lastIndexOf('.') + 1)
  }
}
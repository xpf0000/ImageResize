import is from 'electron-is'
import path from 'path'
const index = path.resolve(__dirname, '../render/index.html')
export default {
  index: {
    attrs: {
      title: 'WebMaker',
      width: 640,
      height: 525,
      minWidth: 640,
      minHeight: 525,
      backgroundColor: '#262D3D',
      transparent: !is.windows()
    },
    bindCloseToHide: true,
    url: is.dev() ? 'http://localhost:3000' : `file://${index}`
  }
}

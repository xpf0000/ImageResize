/**
 * Created by xujian1 on 2018/10/8.
 */
import { CaptureEditor } from './CaptureEditor.js'
import IPC from '../util/IPC.js'
const { screen, getCurrentWindow } = require('@electron/remote')

export const globles = {
  currentWinId: 0,
  screenWidth: 0,
  screenHeight: 0
}

export const getCurrentScreen = () => {
  let win = getCurrentWindow()
  console.log('win: ', win)
  let { x, y } = win.getBounds()
  return screen.getAllDisplays().filter((d) => d.bounds.x === x && d.bounds.y === y)[0]
}

export const isCursorInCurrentWindow = () => {
  let window = getCurrentWindow()
  let { x, y } = screen.getCursorScreenPoint()
  let { x: winX, y: winY, width, height } = window.getBounds()
  return x >= winX && x <= winX + width && y >= winY && y <= winY + height
}

export const getScreenCapture = () => {
  const currentScreen = getCurrentScreen()

  const $canvas = document.getElementById('js-canvas')
  const $sizeInfo = document.getElementById('js-size-info')
  const $toolbar = document.getElementById('js-toolbar')

  const $btnClose = document.getElementById('js-tool-close')
  const $btnOk = document.getElementById('js-tool-ok')
  const $btnReset = document.getElementById('js-tool-reset')

  let capture = new CaptureEditor($canvas)

  let onDrag = (selectRect) => {
    $toolbar.style.display = 'none'
    $sizeInfo.style.display = 'block'
    $sizeInfo.innerText = `${selectRect.w} * ${selectRect.h}`
    if (selectRect.y > 35) {
      $sizeInfo.style.top = `${selectRect.y - 30}px`
    } else {
      $sizeInfo.style.top = `${selectRect.y + 10}px`
    }
    $sizeInfo.style.left = `${selectRect.x}px`
  }
  capture.on('start-dragging', onDrag)
  capture.on('dragging', onDrag)

  let onDragEnd = () => {
    if (capture.selectRect) {
      IPC.send('App:Capture-Screen', {
        type: 'select',
        screenId: currentScreen.id
      })
      const { x, w, b } = capture.selectRect
      console.log('capture.selectRect: ', capture.selectRect)
      $toolbar.style.display = 'flex'
      $toolbar.style.top = `${b + 15}px`
      $toolbar.style.left = `${x + w - 105}px`
    }
  }
  capture.on('end-dragging', onDragEnd)
  IPC.on('App:Capture-Screen').then(({ type, screenId }) => {
    if (type === 'select') {
      if (screenId && screenId !== currentScreen.id) {
        capture.disable()
      }
    }
  })

  capture.on('reset', () => {
    $toolbar.style.display = 'none'
    $sizeInfo.style.display = 'none'
  })

  $btnClose.addEventListener('click', () => {
    IPC.send('App:Capture-Screen', {
      type: 'close'
    })
    window.close()
  })

  $btnReset.addEventListener('click', () => {
    capture.reset()
  })

  let selectCapture = () => {
    if (!capture.selectRect) {
      return
    }
    getCurrentWindow().hide()
    const task = {
      scaleFactor: capture.scaleFactor,
      selectRect: capture.selectRect
    }
    console.log('task: ', task)
    IPC.send('App:Capture-Screen', {
      type: 'complete',
      task: task
    })
  }
  $btnOk.addEventListener('click', selectCapture)
}

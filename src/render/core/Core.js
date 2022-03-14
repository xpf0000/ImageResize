// 模型和动画数据
import path from 'path-browserify'
export const VRM = {}
export const Animations = {}
const Base = import.meta.url
let fbxs = import.meta.globEager('../assets/animo/*.json')
for (let key in fbxs) {
  const name = path.basename(key, '.json')
  Animations[name] = fbxs[key].default
}

const vrms = import.meta.glob('../assets/model/*')
for (let key in vrms) {
  const name = path.basename(key, '.vrm')
  VRM[name] = new URL(key, Base).href
}

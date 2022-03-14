const state = {
  app: {},
  files: [],
  taskShow: false
}
const getters = {
  app: (state) => state.app,
  files: (state) => state.files,
  taskShow: (state) => state.taskShow
}
const mutations = {
  SET_APP(state, val) {
    state.app = val
  },
  SET_FILES(state, val) {
    state.files = val
  },
  SET_TASK_SHOW(state, val) {
    state.taskShow = val
  }
}
const actions = {}
export default { state, getters, mutations, actions }

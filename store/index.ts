import type { MutationTree, ActionTree } from 'vuex'
import { Glasses } from '~/model/GlassesModel'

const arrayContainsSku = (data: Glasses[], sku: number) => data.some(e => e.sku === sku)

export interface RootState {
  allGlasses: Glasses[],
  lastRefresh: Date | null,
  isOutdated: boolean,
  location: string,
  error: string,
  drawer: boolean,
  isRefreshingGlasses: boolean
}
export const state = (): RootState => ({
  allGlasses: [],
  lastRefresh: null,
  location: 'sa',
  error: '',
  drawer: false,
  isOutdated: false,
  isRefreshingGlasses: false
})

export const MutationType = {
  SET_GLASSES: 'setGlasses',
  SET_LOCATION: 'setLocation',
  SET_LAST_REFRESH: 'setLastRefresh',
  SET_OUTDATED_FLAG: 'setOutdatedFlag',
  SET_IS_REFRESHING_GLASSES: 'setIsRefreshingGlasses',
  DELETE_OFFLINE_GLASSES: 'deleteOfflineGlasses',
  ADD_OFFLINE_GLASSES: 'addOfflineGlasses',
  SET_ERROR: 'setError',
  CLEAR_ERROR: 'clearError',
  TOGGLE_DRAWER: 'toggleDrawer',
  SET_DRAWER: 'setDrawer'
}
export const mutations: MutationTree<RootState> = {
  [MutationType.SET_GLASSES]: (state, value: Glasses[]) => { state.allGlasses = value },
  [MutationType.SET_LOCATION]: (state, value: string) => { state.location = value },
  [MutationType.SET_LAST_REFRESH]: (state, value: Date) => { state.lastRefresh = value },
  [MutationType.SET_OUTDATED_FLAG]: (state, value: boolean) => { state.isOutdated = value },
  [MutationType.SET_IS_REFRESHING_GLASSES]: (state, value: boolean) => { state.isRefreshingGlasses = value },
  [MutationType.DELETE_OFFLINE_GLASSES]: (state, sku: number) => {
    if (arrayContainsSku(state.allGlasses, sku)) {
      // call arrayContainsSku to avoid unnecessary reactive changes when replacing the array like this
      state.allGlasses = state.allGlasses.filter(el => el.sku !== sku)
    }
  },
  [MutationType.ADD_OFFLINE_GLASSES]: (state, glasses: Glasses) => {
    if (!arrayContainsSku(state.allGlasses, glasses.sku)) {
      state.allGlasses.push(glasses)
    }
  },
  [MutationType.SET_ERROR]: (state, message:string) => {
    state.error = message
  },
  [MutationType.CLEAR_ERROR]: (state) => {
    state.error = ''
  },
  [MutationType.TOGGLE_DRAWER]: (state) => {
    state.drawer = !state.drawer
  },
  [MutationType.SET_DRAWER]: (state, value) => {
    state.drawer = value
  }
}

export const ActionType = {
  LOAD_GLASSES: 'loadGlasses'
}
export const actions: ActionTree<RootState, RootState> = {

  async [ActionType.LOAD_GLASSES]({ commit, state }) {
    commit(MutationType.SET_IS_REFRESHING_GLASSES, true)
    // fetch with a long timeout, because we can afford to wait and a timeout would be totally unnecessary (e.g. with a bad connection in el salvador)
    const data = await this.$axios.$get(`/api/glasses/${state.location}`, { params: { size: 100000 }, timeout: 60000 }) as any
    commit(MutationType.SET_GLASSES, data.glasses)
    commit(MutationType.SET_OUTDATED_FLAG, false)
    commit(MutationType.SET_LAST_REFRESH, new Date().toISOString())
    commit(MutationType.SET_IS_REFRESHING_GLASSES, false)
  }

}

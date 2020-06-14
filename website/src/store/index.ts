import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export enum MUTATIONS {
  ADD_SERVER = 'ADD_SERVER',
  SET_SERVER_DATA = 'SET_SERVER_DATA',
}

export default new Vuex.Store({
  state: {
    servers: [
      {
        host: '185.236.8.19:27015',
        data: null,
      },
    ],
  },
  getters: {
    servers: (state) => state.servers,
  },
  mutations: {
    [MUTATIONS.ADD_SERVER](state, host) {
      console.log('ADD HOST', host);
      if (!state.servers.find((server) => server.host === host)) {
        state.servers.push({ host, data: null });
      }
    },
    [MUTATIONS.SET_SERVER_DATA](state, { host, data }) {
      const index = state.servers.findIndex((server) => server.host === host);
      if (index !== -1) {
        state.servers[index].data = data;
      }
    },
  },
  actions: {
  },
  modules: {
  },
});

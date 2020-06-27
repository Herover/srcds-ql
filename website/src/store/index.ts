import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export enum MUTATIONS {
  ADD_SERVER = 'ADD_SERVER',
  SET_SERVER_DATA = 'SET_SERVER_DATA',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
}

export interface IServer {
  host: string
  password: string | null
  data: { [key: string]: string | number | boolean } | null
}

export default new Vuex.Store({
  state: {
    servers: [
      {
        host: '185.236.8.19:27015',
        password: null,
        data: null,
      },
    ] as IServer[],
  },
  getters: {
    servers: (state) => state.servers,
  },
  mutations: {
    [MUTATIONS.ADD_SERVER](state, host) {
      console.log('ADD HOST', host);
      if (!state.servers.find((server) => server.host === host)) {
        state.servers.push({ host, data: null, password: null });
      }
    },
    [MUTATIONS.SET_SERVER_DATA](state, { host, data }) {
      const index = state.servers.findIndex((server) => server.host === host);
      if (index !== -1) {
        state.servers[index].data = data;
      }
    },
    [MUTATIONS.UPDATE_PASSWORD](state, { host, password }) {
      const index = state.servers.findIndex((server) => server.host === host);
      if (index !== -1) {
        state.servers[index].password = password;
      }
    },
  },
  actions: {
  },
  modules: {
  },
});

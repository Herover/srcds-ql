<template>
  <div>
    <div v-if="error" class="text-danger">
      {{ error.graphQLErrors.reduce((l, n) => { l.push(n.message); return l; }, []).join(', ') }}
      for
      {{ host }}
      <span v-on:click="removePassword" class="btn btn-link">Remove password</span>
    </div>
    <div v-if="server">
      <div v-on:click="toggleExpand" class="server-row row align-items-center">
        <div class="col-md-1 status-holder"><div :class="'status ' + status"></div></div>
        <div class="col-md-3 server-name">{{ server.serverName }}</div>
        <div class="col-md-4 map-name">{{ server.mapName }}</div>
        <div class="col-md-4 player-num-holder">
          <div class="player-num-current">{{ server.numberOfPlayers }}
            <small class="player-num-max"> / {{ server.maxPlayers }}</small>
          </div>
          <div class="player-num-max"></div>
        </div>
      </div>
      <div
        v-if="expanded"
        class="col-12"
      >
        <div class="row">
          <div class="col-6">
            <label for="server-password">Password</label>
            <input id="server-password" v-model="passwordInput"/>
            <button v-on:click="updatePassword">Update password</button>
          </div>
          <div
            class="col-6"
          >
            <div
              v-for="player in server.players"
              v-bind:key="player.name"
            >
              {{ player.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      Loading {{ host }}...
    </div>
  </div>
</template>

<script lang="ts">
import gql from 'graphql-tag';
import {
  Component,
  Prop,
  Vue,
} from 'vue-property-decorator';
import 'vue-apollo';

import { MUTATIONS } from '@/store/index';

Component.registerHooks(['apollo']);

const PING_WARNING_TRESHOLD = 150;
const CLASS_STATUS_OK = 'status-ok';
const CLASS_STATUS_WARNING = 'status-warning';
const CLASS_STATUS_LOADING = 'status-loading';
const CLASS_STATUS_ERROR = 'status-error';

// TODO: As long as apollo types are not correctly merged with Vue, Typescript wont know about
// $apolloData

@Component
export default class ServerInfo extends Vue {
  @Prop() private host!: string;

  @Prop() private password: string | undefined;

  private passwordInput = '';

  private expanded = false;

  private error?: Error;

  get status() {
    if ((this as any).$apolloData.queries.server.loading) {
      return CLASS_STATUS_LOADING;
    }
    if (this.error) {
      return CLASS_STATUS_ERROR;
    }
    if ((this as any).$apolloData.data.server.ping > PING_WARNING_TRESHOLD) {
      return CLASS_STATUS_WARNING;
    }
    return CLASS_STATUS_OK;
  }

  // eslint-disable-next-line class-methods-use-this
  get apollo() {
    return {
      server: {
        query: gql`query ($host: String!, $password: String) {
          server(host: $host, password: $password) {
            serverName
            mapName
            numberOfPlayers
            maxPlayers
            ping
            players {
              name
              score
              clientPort
            }
          }
        }`,
        variables(): any {
          return {
            host: (this as any as ServerInfo).host,
            password: (this as any as ServerInfo).password,
          };
        },
        error(error: Error) {
          (this as any as ServerInfo).error = error;
        },
        update(data: any) {
          if (data.server) {
            (this as any).error = null;
          }
          return data.server;
        },
        pollInterval: 60 * 1000,
      },
    };
  }

  toggleExpand() {
    this.expanded = !this.expanded;
  }

  updatePassword() {
    this.$store.commit(
      MUTATIONS.UPDATE_PASSWORD,
      { password: this.passwordInput, host: this.host },
    );
    this.$apollo.queries.server.refresh();
  }

  removePassword() {
    this.$store.commit(
      MUTATIONS.UPDATE_PASSWORD,
      { password: null, host: this.host },
    );
    this.$apollo.queries.server.refresh();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.server-row {
  font-size: 2em;
}

.server-name {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.status {
  width: 1.5em;
  height: 1.5em;
  border-radius: 50%;
}
.status-ok {
  background-color: #30ff10;
}
.status-warning {
  background-color: #ff9900;
}
.status-error {
  background-color: #ff3111;
}
.status-loading {
  background-color: #09a9f3;
}
</style>

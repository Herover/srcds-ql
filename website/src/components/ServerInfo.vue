<template>
  <div class="server-row">
    <small>{{ host }}</small>
    <div v-if="server">
      <h2>{{ server.serverName }}</h2>
      <p>{{ server.numberOfPlayers }} / {{ server.maxPlayers }}</p>
    </div>
    <div v-else>
    </div>
    <div class="status-holder"><div :class="'status ' + status"></div></div>
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
        query: gql`query ($host: String!) {
          server(host: $host) {
            serverName
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
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.server-row {
  width: 100%;
  border: 1px solid #a0a0a0;
}
.status {
  width: 3em;
  height: 3em;
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

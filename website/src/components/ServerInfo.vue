<template>
  <div class="hello">
    <div v-if="server">
      <h2>{{ server.serverName }}</h2>
      <ul>
        <li
          v-for="player in server.players"
          v-bind:key="player.id"
        >
          {{ player.name }}
        </li>
      </ul>
    </div>
    <div v-else>
      <h2>{{ host }}...</h2>
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

@Component({
  apollo: {
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
          host: (this as any).$props.host,
        };
      },
      pollInterval: 60 * 1000,
    },
  },
} as any)
export default class ServerInfo extends Vue {
  @Prop() private host!: string;

  mounted() {
    console.log(this);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>

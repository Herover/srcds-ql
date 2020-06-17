<template>
  <div class="home">
    <h1>Enter IP address of server</h1>
    <HostInput
      v-on:host="addHost"
    />
    <div class="servers">
      <ServerInfo
        v-for="serverInfo in servers"
        v-bind:key="serverInfo.host"
        v-bind:host="serverInfo.host"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  Vue, Component,
} from 'vue-property-decorator';

import HostInput from '@/components/HostInput.vue';
import ServerInfo from '@/components/ServerInfo.vue';

import { MUTATIONS } from '@/store/index';

@Component({
  name: 'Home',
  components: {
    HostInput,
    ServerInfo,
  },
})
export default class Home extends Vue {
  mounted() {
    console.log(this.servers.map((server: any) => server.host));
  }

  addHost(newHost: string) {
    this.$store.commit(MUTATIONS.ADD_SERVER, newHost);
  }

  get servers(): string[] {
    return this.$store.getters.servers;
  }
}
</script>

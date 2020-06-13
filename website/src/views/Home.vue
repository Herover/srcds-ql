<template>
  <div class="home">
    <h1>Enter IP address of server</h1>
    <HostInput/>
  </div>
</template>

<script>
// @ is an alias to /src
import HostInput from '@/components/HostInput.vue';

export default {
  name: 'Home',
  components: {
    HostInput,
  },
};
</script>

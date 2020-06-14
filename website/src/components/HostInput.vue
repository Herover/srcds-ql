<template>
  <div class="hello">
    <input
      v-model="host"
      v-on:keyup.enter="submit"
      placeholder="1.2.3.4:27016 or example.com"
    />
    <button v-on:click="submit">Connect</button>
  </div>
</template>

<script lang="ts">
import {
  Component, Vue,
} from 'vue-property-decorator';

@Component
export default class HostInput extends Vue {
  private host = '';

  submit() {
    this.$emit('host', this.host);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>

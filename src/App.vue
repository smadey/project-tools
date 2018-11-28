<template>
  <div id="app">
    <router-view style="padding: 20px" :key="$route.path" />
  </div>
</template>

<script>
export default {
  name: 'app',
}
</script>

<style>
html {
  height: 100%;
}
body {
  height: 100%;
  margin: 0;
}
a {
  color: inherit;
  text-decoration: none;
}
p {
  margin: 0;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
}
</style>

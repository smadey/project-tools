// import Vue from 'vue'
// import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'

import upgrade from './upgrade'

import App from './App.vue'
import router from './router'

Vue.config.productionTip = false
// Vue.use(ElementUI)

new Vue({
  router,
  render: h => h(App),
  mounted() {
    if (process.env.NODE_ENV === 'production') {
      upgrade({
        confirm: ({ version }) => {
          return this.$confirm(`确认升级到"${version}"?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
          })
        },
      }).then(({ status }) => {
        if (status === 'success') {
          this.$message({
            type: 'success',
            message: '升级成功',
            showClose: true,
            onClose: () => location.reload(),
          })
        }
      }).catch((err) => {
        this.$message.error(`升级失败: ${err.message}`)
      })
    }
  },
}).$mount('#app')

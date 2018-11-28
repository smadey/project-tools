// import Vue from 'vue'
// import VueRouter from 'vue-router'

import ProjectList from '@/views/List.vue'
import ProjectDetail from '@/views/Detail.vue'

// Vue.use(VueRouter)

export default new VueRouter({
  routes: [
    {
      path: '/',
      name: 'projList',
      component: ProjectList
    },
    {
      path: '/add',
      name: 'projAdd',
      component: ProjectDetail,
    },
    {
      path: '/:id',
      name: 'projEdit',
      component: ProjectDetail,
    },
    {
      path: '*',
      redirect: '/',
    },
  ]
})

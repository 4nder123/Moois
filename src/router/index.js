import { createRouter, createMemoryHistory } from 'vue-router'
import { SocketDisconnect } from '@/socket'
import store from "@/store";

const routes = [
  {
    path: '/kodutood',
    name: 'kodutood',
    component: () => import('../views/kodutood.vue')
  },
  {
    path: '/tunniplaan',
    name: 'tunniplaan',
    component: () => import('../views/tunniplaan.vue')
  },
  {
    path: '/login/:email?/:success?',
    name: 'login',
    props: true,
    component: () => import('../views/login.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/register.vue'),
  },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const getDefaultPage = () => (localStorage.getItem('defaultPage') === 'true' ? '/kodutood' : '/tunniplaan');
  if (to.path === '/' || to.path === '') {
    const defaultPage = getDefaultPage();
    if (!['/kodutood', '/tunniplaan'].includes(window.name)) {
      window.name = defaultPage;
    }
    return next(window.name || defaultPage);
  }
  if (['/login', '/register'].includes(to.path)) {
    if(store.getters.getSettingsVisibility) {store.dispatch('changeSettingsVisibility');}
    SocketDisconnect();
    return next();
  }
  window.name = to.path;
  next();
});
export default router

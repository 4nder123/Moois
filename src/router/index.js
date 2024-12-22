import { createRouter, createMemoryHistory } from 'vue-router'
import tunniplaan from '../views/tunniplaan.vue'
import kodutood from '../views/kodutood.vue'
import login from '../views/login.vue'
import register from '../views/register.vue'
import { SocketDisconnect } from '@/socket'
import store from "@/store";

const routes = [
  {
    path: '/kodutood',
    name: 'kodutood',
    component: kodutood,
  },
  {
    path: '/tunniplaan',
    name: 'tunniplaan',
    component: tunniplaan,
  },
  {
    path: '/login/:email?/:success?',
    name: 'login',
    props: true,
    component: login,
  },
  {
    path: '/register',
    name: 'register',
    component: register,
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

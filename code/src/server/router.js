import WorkSpace from '../components/WorkSpace.vue';
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/HomePage.vue';
import UploadFile from '../components/UploadFile.vue';
import ConsentForm from '../components/ConsentForm.vue';
import DownloadFile from '@/components/DownloadFile.vue';
import store from './store.js';


const router = createRouter({
    history: createWebHistory(),
    routes: [{ path: '/workSpace/:id', component: WorkSpace, name: 'WorkSpace',props: true },
    {path: '/Home', component: Home, name: 'Home',
    },
    {path: '/Download', component: DownloadFile, name:"DownloadFile"},
    {path: '/Upload', component: UploadFile, name:"UploadFile",
    },
    {path: '/', component: ConsentForm, name:"ConsentForm"},

    ]
});
router.beforeEach((to, from, next) => {
    if (to.name === 'WorkSpace' && !store.state.canAccessWorkSpace) {
      console.log("going to workspace");
      next({ name: 'Home' });
    } else {
      next();
    }
  });



export default router
 

  

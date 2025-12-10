import route from './route';
import schedule from './schedule';

const routes = {
  admin: {
    type: 'admin',
    routes: [...route],
  },
  'content-api': {
    type: 'content-api',
    routes: [...schedule],
  },
};

export default routes;

const MainRoutes = [
  {
    method: 'GET',
    path: '/',
    handler: 'controller.getData',
    config: {
      policies: [],
      auth: {
        scope: ['plugin::strapi-calendar.read'],
      },
    },
  },
  {
    method: 'GET',
    path: '/collections',
    handler: 'controller.getCollections',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/extensions',
    handler: 'controller.getExtensions',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/settings',
    handler: 'controller.getSettings',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'POST',
    path: '/settings',
    handler: 'controller.setSettings',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/clear-settings',
    handler: 'controller.clearSettings',
    config: {
      policies: [],
      auth: false,
    },
  },
  {
    method: 'POST',
    path: '/events',
    handler: 'controller.createEvent',
    config: {
      policies: [],
      auth: {
        scope: ['plugin::strapi-calendar.create'],
      },
    },
  },
  {
    method: 'PUT',
    path: '/events/:id',
    handler: 'controller.updateEvent',
    config: {
      policies: [],
      auth: {
        scope: ['plugin::strapi-calendar.update'],
      },
    },
  },
  {
    method: 'DELETE',
    path: '/events/:id',
    handler: 'controller.deleteEvent',
    config: {
      policies: [],
      auth: {
        scope: ['plugin::strapi-calendar.delete'],
      },
    },
  },
];

export default MainRoutes;

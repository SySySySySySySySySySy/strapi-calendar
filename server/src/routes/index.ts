export default [
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
      policies: ['plugin::strapi-calendar.isSuperAdmin'],
      auth: {
        scope: ['plugin::strapi-calendar.settings'],
      },
    },
  },
  {
    method: 'POST',
    path: '/settings',
    handler: 'controller.setSettings',
    config: {
      policies: ['plugin::strapi-calendar.isSuperAdmin'],
      auth: {
        scope: ['plugin::strapi-calendar.settings'],
      },
    },
  },
  {
    method: 'GET',
    path: '/clear-settings',
    handler: 'controller.clearSettings',
    config: {
      policies: ['plugin::strapi-calendar.isSuperAdmin'],
      auth: {
        scope: ['plugin::strapi-calendar.settings'],
      },
    },
  },
];

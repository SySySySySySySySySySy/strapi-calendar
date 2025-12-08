import type { Core } from "@strapi/strapi";

const routes: Core.Route[] = [
	{
    method: 'GET',
    path: '/',
    handler: 'controller.getData',
    config: {
      policies: [],
    },
    info: {
			apiName: "Get Setting",
			pluginName: "strapi-calendar",
			type: "calendar",
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
    info: {
			apiName: "Get Collections",
			pluginName: "strapi-calendar",
			type: "calendar",
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
    info: {
      apiName: "Get Extensions",
      pluginName: "strapi-calendar",
      type: "calendar",
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
    info: {
      apiName: "Get Settings",
      pluginName: "strapi-calendar",
      type: "calendar",
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
    info: {
      apiName: "Set Settings",
      pluginName: "strapi-calendar",
      type: "calendar",
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
    info: {
      apiName: "Clear Settings",
      pluginName: "strapi-calendar",
      type: "calendar",
    },
  },
];

export default routes;

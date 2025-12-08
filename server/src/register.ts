import type { Core } from '@strapi/strapi';

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  // Register plugin permissions
  strapi.admin.services.permission.actionProvider.registerMany([
    {
      section: 'plugins',
      displayName: 'Access the calendar',
      uid: 'read',
      pluginName: 'strapi-calendar',
    },
    {
      section: 'plugins',
      displayName: 'Access calendar settings',
      uid: 'settings',
      pluginName: 'strapi-calendar',
    },
  ]);
};

export default register;

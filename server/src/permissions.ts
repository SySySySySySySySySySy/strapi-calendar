import type { Core } from '@strapi/strapi';

const permissions = {
  render: (uid: string) => `plugin::strapi-calendar.${uid}`,
  plugin: {
    calendar: 'calendar',
    settings: 'settings',
    read: 'read',
    create: 'create',
    update: 'update',
    delete: 'delete',
  },
};

export const setupPermissions = async ({ strapi }: { strapi: Core.Strapi }) => {
  // Add permissions
  const actions = [
    {
      section: 'plugins',
      displayName: 'Calendar',
      uid: permissions.plugin.calendar,
      pluginName: 'strapi-calendar',
    },
    {
      section: 'plugins',
      displayName: 'Settings',
      uid: permissions.plugin.settings,
      pluginName: 'strapi-calendar',
    },
    {
      section: 'plugins',
      displayName: 'Read',
      uid: permissions.plugin.read,
      pluginName: 'strapi-calendar',
    },
    {
      section: 'plugins',
      displayName: 'Create',
      uid: permissions.plugin.create,
      pluginName: 'strapi-calendar',
    },
    {
      section: 'plugins',
      displayName: 'Update',
      uid: permissions.plugin.update,
      pluginName: 'strapi-calendar',
    },
    {
      section: 'plugins',
      displayName: 'Delete',
      uid: permissions.plugin.delete,
      pluginName: 'strapi-calendar',
    },
  ];
  await strapi.admin.services.permission.actionProvider.registerMany(actions);
};

export default permissions;

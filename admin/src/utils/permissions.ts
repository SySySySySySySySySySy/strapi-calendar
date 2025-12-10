const render = (uid: string) => {
  return `plugin::strapi-calendar.${uid}`;
};

const plugin = {
  calendar: 'calendar',
  settings: 'settings',
};

// This should be equal to admin side. Strapi push to make admin and server independent chunks.
const pluginPermissions = {
  calendar: [{ action: render(plugin.calendar), subject: null }],
  settings: [{ action: render(plugin.settings), subject: null }],
};

export default pluginPermissions;

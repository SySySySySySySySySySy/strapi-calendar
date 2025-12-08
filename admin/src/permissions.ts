import { PLUGIN_ID } from './pluginId';

const pluginPermissions = {
  // Permission to access the calendar page
  accessCalendar: [
    {
      action: `plugin::${PLUGIN_ID}.read`,
      subject: null,
    },
  ],
  // Permission to access calendar settings
  accessSettings: [
    {
      action: `plugin::${PLUGIN_ID}.settings`,
      subject: null,
    },
  ],
};

export default pluginPermissions;

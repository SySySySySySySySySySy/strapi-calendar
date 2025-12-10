import type { Core } from '@strapi/strapi';
import { PLUGIN_ID } from '../../../admin/src/pluginId';

const EventScheduleRoutes: Core.Route[] = [
  {
    method: 'GET',
    path: '/event-schedules',
    handler: 'schedule.getSchedule',
    info: {
      apiName: 'Get Event Schedules',
      pluginName: PLUGIN_ID,
      type: 'Event Schedules',
    },
  },
];

export default EventScheduleRoutes;

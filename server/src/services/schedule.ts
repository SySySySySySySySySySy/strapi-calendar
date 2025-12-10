import type { Core } from '@strapi/strapi';
import moment from 'moment';
import type { SettingsType } from '../../../types';
import { getPluginStore } from '../utils';

export interface ScheduleEvent {
  name: string;
  detail: string | null;
  start: string;
  end: string;
  category_name: string;
  category_color: string;
}

const EventScheduleService = ({ strapi }: { strapi: Core.Strapi }) => ({
  getSchedule: async (start: string, end: string, slug: string) => {
    const pluginStore = getPluginStore();
    const config: SettingsType | null = await pluginStore.get({
      key: 'settings',
    });
    if (!config) return [];

    const schedules = await strapi.documents(config.collection as any).findMany({
      populate: ['event_category'],
      status: 'published',
      sort: [{ start: 'asc' }, { end: 'asc' }],
      filters: {
        $and: [
          {
            [config.startField]: {
              $gte: moment(start).startOf('day').format(),
              $lte: moment(end).endOf('day').format(),
            },
          },
          {
            hotel: {
              slug: {
                $eq: slug,
              },
            },
          },
        ],
      },
    });

    const results: Record<string, ScheduleEvent[]> = {};
    const diffInDays = moment(end).diff(start, 'days');
    for (let i = 0; i < diffInDays; i++) {
      const date = moment(start).add(i, 'days');
      const filteredSchedules = schedules.filter((schedule) => {
        return (
          date.isSameOrAfter(schedule.start, 'date') && date.isSameOrBefore(schedule.end, 'date')
        );
      });
      results[moment(date).format('YYYY-MM-DD')] = filteredSchedules.map((schedule: any) => {
        return {
          name: schedule.name,
          detail: schedule.detail,
          start: schedule.start,
          end: schedule.end,
          category_name: schedule.event_category.name,
          category_color: schedule.event_category.color,
        };
      });
    }

    return results;
  },
});

export default EventScheduleService;

import type { Core } from '@strapi/strapi';
import type { Context } from 'koa';
import * as z from 'zod/mini';
import { PLUGIN_ID } from '../../../admin/src/pluginId';

const EventScheduleController = ({ strapi }: { strapi: Core.Strapi }) => ({
  async getSchedule(ctx: Context) {
    const schema = z.object({
      start: z.iso.date(),
      end: z.iso.date(),
      slug: z.string(),
    });

    try {
      const query = schema.parse(ctx.query);
      ctx.body = await strapi
        .plugin(PLUGIN_ID)
        .service('schedule')
        .getSchedule(query.start, query.end, query.slug);
    } catch (error) {
      if (error instanceof z.core.$ZodError) {
        ctx.status = 422;
        ctx.body = error.issues;
      }
    }
  },
});

export default EventScheduleController;

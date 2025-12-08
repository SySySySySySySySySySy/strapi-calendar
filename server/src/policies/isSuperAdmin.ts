import type { Core } from '@strapi/strapi';

/**
 * `isSuperAdmin` policy
 *
 * Ensures that only users with the super admin role can access the endpoint.
 */
export default (policyContext: any, config: any, { strapi }: { strapi: Core.Strapi }) => {
  const { user } = policyContext.state;

  if (!user) {
    return false;
  }

  // Check if user has super admin role
  const isSuperAdmin = user.roles?.some((role: any) => role.type === 'strapi-super-admin') ?? false;

  return isSuperAdmin;
};

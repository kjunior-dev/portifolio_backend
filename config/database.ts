import type { Core } from '@strapi/strapi';

const config = ({
                  env,
                }: Core.Config.Shared.ConfigParams): Core.Config.Database => {
  const databaseUrl = env('DATABASE_URL');

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not set. Please set it to your Railway Postgres connection string.'
    );
  }

  return {
    connection: {
      client: 'postgres',

      connection: {
        connectionString: databaseUrl,

        // Railway Postgres interno: SSL desativado explicitamente
        ssl: false,
      },

      pool: {
        min: 0,
        max: env.int('DATABASE_POOL_MAX', 10),
      },

      acquireConnectionTimeout: env.int(
          'DATABASE_CONNECTION_TIMEOUT',
          60000
      ),
    },
  } as Core.Config.Database;
};

export default config;

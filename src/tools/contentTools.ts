import { z } from 'zod';
import {
  getContentByPath,
  getFolder,
  getPersonalFolder,
} from '@/domains/sumologic/content.js';
import type { ToolDefinition } from '@/tools/types.js';

export const contentTools: ToolDefinition[] = [
  {
    name: 'get_content_by_path',
    description: 'Get Sumo Logic library content by path.',
    schema: {
      path: z.string(),
    },
    handler: async (client, { path }) =>
      getContentByPath(client, path as string),
  },
  {
    name: 'get_personal_folder',
    description: 'Get the personal content folder for the authenticated user.',
    schema: {},
    handler: async (client) => getPersonalFolder(client),
  },
  {
    name: 'get_folder',
    description: 'Get a Sumo Logic content folder by ID.',
    schema: {
      folderId: z.string(),
    },
    handler: async (client, { folderId }) =>
      getFolder(client, folderId as string),
  },
];

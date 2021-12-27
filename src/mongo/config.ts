import { CollectionType, SchemaType } from './types/types';
import { AmocrmUsers, AmocrmUsersSchema } from './schemas';

export const Schemas: SchemaType = {
    [CollectionType.amocrmUsers]: { schema: AmocrmUsersSchema, class: AmocrmUsers },

};
import { CollectionType, SchemaType } from './types/types';
import { AmocrmUsers, AmocrmUsersSchema, LdsUsersStatus, LdsUsersStatusSchema } from './schemas';

export const Schemas: SchemaType = {
    [CollectionType.amocrmUsers]: { schema: AmocrmUsersSchema, class: AmocrmUsers },
    [CollectionType.ldsUserStatus]: { schema: LdsUsersStatusSchema, class: LdsUsersStatus },

};
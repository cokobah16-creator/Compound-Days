import { sqliteTable, text, integer, primaryKey, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const households = sqliteTable('households', {
 code: text('code').primaryKey(), state: text('state').notNull(), revision: integer('revision').notNull().default(0),
 createdAt: integer('created_at').notNull(), updatedAt: integer('updated_at').notNull(),
});
export const householdMembers = sqliteTable('household_members', {
 code: text('code').notNull().references(() => households.code), slot: integer('slot').notNull(),
 userId: text('user_id').notNull(), session: text('session').notNull(), seenAt: integer('seen_at').notNull().default(0),
 presence: text('presence').notNull().default('{}'),
}, t => [primaryKey({columns:[t.code,t.slot]}), uniqueIndex('household_member_identity').on(t.code,t.userId)]);
export const householdMutations = sqliteTable('household_mutations', {
 code: text('code').notNull().references(() => households.code), userId: text('user_id').notNull(), id: text('id').notNull(),
 revision: integer('revision').notNull(), createdAt: integer('created_at').notNull(),
}, t => [primaryKey({columns:[t.code,t.userId,t.id]})]);

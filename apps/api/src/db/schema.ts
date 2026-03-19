import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const notes = pgTable("notes", {
	id: serial("id").primaryKey(),
	title: text("title").notNull(),
	content: text("content").notNull().default(""),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

CREATE TABLE `household_members` (
	`code` text NOT NULL,
	`slot` integer NOT NULL,
	`user_id` text NOT NULL,
	`session` text NOT NULL,
	`seen_at` integer DEFAULT 0 NOT NULL,
	`presence` text DEFAULT '{}' NOT NULL,
	PRIMARY KEY(`code`, `slot`),
	FOREIGN KEY (`code`) REFERENCES `households`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `household_member_identity` ON `household_members` (`code`,`user_id`);--> statement-breakpoint
CREATE TABLE `household_mutations` (
	`code` text NOT NULL,
	`user_id` text NOT NULL,
	`id` text NOT NULL,
	`revision` integer NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`code`, `user_id`, `id`),
	FOREIGN KEY (`code`) REFERENCES `households`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `households` (
	`code` text PRIMARY KEY NOT NULL,
	`state` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);

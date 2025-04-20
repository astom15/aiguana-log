import { z } from "zod";
import { TriggerType } from "../types/changelog.types";
import { ObjectId } from "mongodb";

export const generateChangelogBodySchema = z.object({
	raw_input: z.string().min(1, { message: "Raw input is required" }),
	trigger_type: z.nativeEnum(TriggerType).default(TriggerType.MANUAL),
});

export const changelogResponseSchema = z.object({
	_id: z.instanceof(ObjectId).transform((id) => id.toString()),
	title: z.string(),
	description: z.string(),
	commitShas: z.array(z.string()),
	pullRequestUrl: z.string().nullable(),
	tags: z.array(z.string()),
	status: z.enum(["draft", "published"]),
	triggerType: z.nativeEnum(TriggerType),
	generatedAt: z.date().transform((date) => date.toISOString()),
	publishedAt: z
		.date()
		.nullable()
		.transform((date) => date?.toISOString() ?? null),
	author: z.string().nullable(),
	breaking_change: z.boolean(),
});

export const changelogListResponseSchema = z.array(changelogResponseSchema);

export type GenerateChangelogBody = z.infer<typeof generateChangelogBodySchema>;
export type ChangelogResponse = z.infer<typeof changelogResponseSchema>;
export type ChangelogListResponse = z.infer<typeof changelogListResponseSchema>;

import { z } from "zod";
import { ObjectId } from "mongodb";
import { TriggerType, Status } from "../types/changelog.types";

export const generateChangelogBodySchema = z.object({
	raw_input: z.string().min(1, { message: "Raw input is required" }),
	trigger_type: z.nativeEnum(TriggerType).default(TriggerType.MANUAL),
});

export const getIdParamsSchema = z.object({
	id: z.string().refine(
		(val) => {
			return ObjectId.isValid(val);
		},
		{ message: "Invalid ObjectId format for ID parameter" }
	),
});

export const changelogResponseSchema = z.object({
	_id: z.instanceof(ObjectId).transform((id) => id.toString()),
	title: z.string(),
	description: z.string(),
	commitShas: z.array(z.string()),
	pullRequestUrl: z.string().nullable(),
	tags: z.array(z.string()),
	status: z.nativeEnum(Status),
	triggerType: z.nativeEnum(TriggerType),
	generatedAt: z
		.date()
		.transform((date) => (date instanceof Date ? date.toISOString() : date)),
	publishedAt: z
		.date()
		.nullable()
		.transform((date) => (date ? date.toISOString() : null)),
	author: z.string().nullable(),
	breaking_change: z.boolean(),
});

export const changelogListResponseSchema = z.array(changelogResponseSchema);

export type GenerateChangelogBody = z.infer<typeof generateChangelogBodySchema>;
export type ChangelogResponse = z.infer<typeof changelogResponseSchema>;
export type ChangelogListResponse = z.infer<typeof changelogListResponseSchema>;
export type GetIdParams = z.infer<typeof getIdParamsSchema>;

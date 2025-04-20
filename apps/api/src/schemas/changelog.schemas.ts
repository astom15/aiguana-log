import { z } from "zod";
import { TriggerType } from "../types/changelog.types";

export const generateChangelogBodySchema = z.object({
	raw_input: z.string().min(1, { message: "Raw input is required" }),
	//commitShas: z.array(z.string()).optional(),
	//pullRequestUrl: z.string().url().optional(),
	trigger_type: z.nativeEnum(TriggerType).default(TriggerType.MANUAL),
});

export type GenerateChangelogBody = z.infer<typeof generateChangelogBodySchema>;

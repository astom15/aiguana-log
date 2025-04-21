import { Status, TriggerType } from "../../../shared-types/src";

export interface SerializedChangelogEntry {
	_id: string;
	title: string;
	description: string;
	commitShas: string[];
	pullRequestUrl?: string | null;
	tags?: string[];
	status: Status;
	triggerType: TriggerType;
	generatedAt: string;
	publishedAt?: string | null;
	author?: string | null;
	breaking_change?: boolean;
}

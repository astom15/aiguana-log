import { ObjectId } from "mongodb";

export interface ChangelogEntry {
	_id: ObjectId;
	title: string;
	description: string;
	commitShas: string[];
	pullRequestUrl?: string | null;
	tags?: string[];
	status: "draft" | "published";
	triggerType: "push" | "pull_request" | "manual";
	generatedAt: Date;
	publishedAt?: Date | null;
	author?: string | null;

	breaking_change?: boolean;
	aiModelUsed?: string;
}

export enum TriggerType {
	PUSH = "push",
	PULL_REQUEST = "pull_request",
	MANUAL = "manual",
}

import { ObjectId } from "mongodb";

export interface ChangelogEntry {
	_id: ObjectId;
	title: string;
	summary: string;
	description: string;
	commitShas: string[];
	pullRequestUrl?: string | null;
	tags?: string[];
	status: Status;
	triggerType: TriggerType;
	generatedAt: Date;
	author?: string | null;
	breaking_change?: boolean;
	aiModelUsed?: string;
}

export enum TriggerType {
	PUSH = "push",
	PULL_REQUEST = "pull_request",
	MANUAL = "manual",
}

export enum Status {
	DRAFT = "draft",
	PUBLISHED = "published",
}

export interface ApiError {
	message: string;
	code?: string;
	statusCode?: number;
}

export interface ChangelogInput {
	prTitle: string;
	prBody: string | null;
	codeDiff: string | undefined;
	tags: string[];
}

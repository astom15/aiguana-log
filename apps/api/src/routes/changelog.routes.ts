import {
	FastifyInstance,
	FastifyPluginOptions,
	FastifyRequest,
	FastifyReply,
} from "fastify";
import { z } from "zod";
import {
	GenerateChangelogBody,
	generateChangelogBodySchema,
	changelogResponseSchema,
	changelogListResponseSchema,
	GetIdParams,
	getIdParamsSchema,
} from "../schemas/changelog.schemas";
import { ObjectId } from "mongodb";
import { generateChangelog } from "../services/openai.service";
import { ChangelogEntry, Status } from "../types/changelog.types";

/**
 * @param fastify - The Fastify instance.
 * @param options - Plugin options.
 */
export default async function changelogRoutes(
	fastify: FastifyInstance,
	_options: FastifyPluginOptions
) {
	const changelogsCollection =
		fastify.mongo.db.collection<ChangelogEntry>("changelogs");

	fastify.get(
		"/",
		{
			schema: {
				response: {
					200: changelogListResponseSchema,
					500: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (_request: FastifyRequest, reply: FastifyReply) => {
			try {
				const entries = await changelogsCollection
					.find(
						{ status: Status.PUBLISHED },
						{
							sort: { generatedAt: 1 },
							limit: 10,
						}
					)
					.toArray();
				reply.code(200).send(entries);
			} catch (error) {
				fastify.log.error(
					error,
					"Failed to retrieve published changelog entries"
				);
				reply
					.code(500)
					.send({ message: "Failed to retrieve changelog entries" });
			}
		}
	);
	fastify.get(
		"/:id",
		{ schema: { params: getIdParamsSchema } },
		async (
			request: FastifyRequest<{ Params: GetIdParams }>,
			reply: FastifyReply
		) => {
			try {
				const id = request.params.id;
				const objectId = new ObjectId(id);
				const entry = await changelogsCollection.findOne({ _id: objectId });
				if (!entry) {
					reply.code(404).send({ message: "Changelog entry not found" });
					return;
				}
				reply.code(200).send(entry);
			} catch (err) {
				fastify.log.error(err, "Failed to retrieve changelog entry");
				if (!reply.sent) {
					reply
						.code(500)
						.send({ message: "Failed to retrieve changelog entry" });
				}
			}
		}
	);
	fastify.post(
		"/generate",
		{
			schema: {
				body: generateChangelogBodySchema,
				response: {
					201: changelogResponseSchema,
					500: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (
			request: FastifyRequest<{ Body: GenerateChangelogBody }>,
			reply: FastifyReply
		) => {
			try {
				const { pr_title, pr_body, tags, trigger_type, is_breaking_change } =
					request.body;

				const { generatedTitle, markdownDescription } = await generateChangelog(
					fastify.openai,
					{
						prTitle: pr_title,
						prBody: pr_body || null,
						tags: tags || [],
					}
				);
				const newEntry: Omit<ChangelogEntry, "_id"> = {
					title: generatedTitle,
					description: markdownDescription,
					commitShas: [], // TODO: Populate from input or trigger context
					pullRequestUrl: null, // TODO: Populate from input or trigger context
					tags: tags, // Example tag
					status: Status.DRAFT,
					triggerType: trigger_type,
					generatedAt: new Date(),
					author: null, // TODO: Populate from input or trigger context
					breaking_change: is_breaking_change,
				};
				const result = await changelogsCollection.insertOne(
					newEntry as ChangelogEntry
				);

				const createdEntry = await changelogsCollection.findOne({
					_id: result.insertedId,
				});

				if (!createdEntry) {
					reply.code(500).send({
						message: "Failed to retrieve created entry after insertion",
					});
					return;
				}

				reply.code(201).send(createdEntry);
			} catch (error: any) {
				fastify.log.error(error, "Failed to generate changelog entry");
				if (!reply.sent) {
					// TODO: Add more specific error handling for OpenAI, Prompt, AI returned
					const message =
						error?.message?.includes("OpenAI") ||
						error?.message?.includes("Prompt") ||
						error?.message?.includes("AI returned")
							? `Failed during AI processing: ${error.message}`
							: "Failed to generate changelog entry";
					reply.code(500).send({ message });
				}
			}
		}
	);
}

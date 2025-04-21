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
import { ChangelogEntry, Status } from "../../../shared-types/src";
import { ObjectId } from "mongodb";
import { generateChangelog } from "../services/openai.service";

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
							sort: { publishedAt: -1 },
							limit: 10,
							// Optionally add projection to exclude fields not needed for the list view
							// projection: { description: 0, commitShas: 0, ... }
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
				const { raw_input, trigger_type } = request.body;

				// --- Restore Original Placeholder Logic ---
				// TODO: Step 13 - Integrate AI call using raw_input
				// TODO: Refine input handling (parse commits, PR data etc.)
				// TODO: Determine title, tags, breaking_change more intelligently

				const { title, description } = await generateChangelog(
					fastify.openai,
					raw_input
				);
				const newEntry: Omit<ChangelogEntry, "_id"> = {
					title,
					description,
					commitShas: [], // TODO: Populate from input or trigger context
					pullRequestUrl: null, // TODO: Populate from input or trigger context
					tags: [trigger_type], // Example tag
					status: Status.DRAFT,
					triggerType: trigger_type, // Assign the validated enum string value
					generatedAt: new Date(),
					publishedAt: null,
					author: null, // TODO: Populate from input or trigger context
					breaking_change: false, // TODO: Determine from input (e.g., Conventional Commits)
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
	// POST /generate
	// GET /:id
	// PUT /:id
	// etc.
}

import {
	FastifyInstance,
	FastifyPluginOptions,
	FastifyRequest,
	FastifyReply,
} from "fastify";
import { z } from "zod";
import { ChangelogEntry, TriggerType } from "../types/changelog.types";
import {
	GenerateChangelogBody,
	generateChangelogBodySchema,
	changelogResponseSchema,
	changelogListResponseSchema,
} from "../schemas/changelog.schemas";
/**
 * @param fastify - The Fastify instance.
 * @param options - Plugin options.
 */
export default async function changelogRoutes(
	fastify: FastifyInstance,
	options: FastifyPluginOptions
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
		async (request: FastifyRequest, reply: FastifyReply) => {
			try {
				const entries = await changelogsCollection
					.find(
						{ status: "published" },
						{
							sort: { publishedAt: -1 },
							limit: 10,
							// Optionally add projection to exclude fields not needed for the list view
							// projection: { description: 0, commitShas: 0, ... }
						}
					)
					.toArray();

				reply.send(entries);
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

				const placeholderTitle = `Generated Entry ${new Date().toISOString()}`;
				const placeholderDescription = `AI description based on input: ${raw_input.substring(0, 50)}...`; // Placeholder

				const newEntry: Omit<ChangelogEntry, "_id"> = {
					title: placeholderTitle,
					description: placeholderDescription,
					commitShas: [], // TODO: Populate from input or trigger context
					pullRequestUrl: null, // TODO: Populate from input or trigger context
					tags: [trigger_type], // Example tag
					status: "draft", // Start as draft
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
			} catch (error) {
				fastify.log.error(error, "Failed to generate changelog entry");
				if (!reply.sent) {
					reply
						.code(500)
						.send({ message: "Failed to generate changelog entry" });
				}
			}
		}
	);
	// POST /generate
	// GET /:id
	// PUT /:id
	// etc.
}

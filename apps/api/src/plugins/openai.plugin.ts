import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";
import OpenAI from "openai";

export interface FastifyOpenai {
	client: OpenAI;
}

async function openaiPlugin(
	fastify: FastifyInstance,
	_options: FastifyPluginOptions
): Promise<void> {
	const apiKey = fastify.config.OPENAI_API_KEY;
	if (!apiKey) {
		fastify.log.error("OPENAI_API_KEY is not defined in the configuration.");
		throw new Error("OPENAI_API_KEY must be defined");
	}
	try {
		const openaiClient = new OpenAI({ apiKey });
		fastify.decorate("openai", openaiClient);
	} catch (err) {
		fastify.log.error(err, "Failed to initialize OpenAI client");
		throw err;
	}
}
export default fp(openaiPlugin);
declare module "fastify" {
	export interface FastifyInstance {
		openai: OpenAI;
	}
}

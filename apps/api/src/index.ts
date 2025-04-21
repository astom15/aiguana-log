import fastify from "fastify";
import cors from "@fastify/cors";
import fastifyEnv from "@fastify/env";
import {
	serializerCompiler,
	validatorCompiler,
	ZodTypeProvider,
} from "fastify-type-provider-zod";
import mongoDbPlugin from "./plugins/mongodb.plugin";
import changelogRoutes from "./routes/changelog.routes";
import openaiPlugin from "./plugins/openai.plugin";

const schema = {
	type: "object",
	required: [
		"PORT",
		"CORS_ORIGIN",
		"MONGODB_URI",
		"MONGODB_DB_NAME",
		"OPENAI_API_KEY",
	],
	properties: {
		NODE_ENV: { type: "string", default: "development" },
		PORT: { type: "number", default: 3001 },
		CORS_ORIGIN: { type: "string" },
		MONGODB_URI: { type: "string" },
		MONGODB_DB_NAME: { type: "string" },
		OPENAI_API_KEY: { type: "string" },
	},
};

const options = {
	confKey: "config",
	schema: schema,
	dotenv: true,
	// Specify path to .env file if it's not in the same directory process is run from
	// data: process.env // You can also pass pre-loaded process.env
};

const buildServer = async () => {
	const server = fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();
	server.setValidatorCompiler(validatorCompiler);
	server.setSerializerCompiler(serializerCompiler);

	await server.register(fastifyEnv, options);
	const corsOrigin = server.config.CORS_ORIGIN;

	await server.register(cors, {
		origin: corsOrigin,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	});
	await server.register(mongoDbPlugin);
	await server.register(openaiPlugin);
	await server.register(changelogRoutes, { prefix: "/api/changelogs" });

	return server;
};

const start = async () => {
	let server;
	try {
		server = await buildServer();
		const port = server.config.PORT;
		await server.listen({ port: port, host: "0.0.0.0" });
	} catch (err) {
		console.error(err);
		if (server) {
			server.log.error(err);
		}
		process.exit(1);
	}
};

start();

declare module "fastify" {
	interface FastifyInstance {
		config: {
			NODE_ENV: string;
			PORT: number;
			CORS_ORIGIN: string;
			MONGODB_URI: string;
			MONGODB_DB_NAME: string;
			OPENAI_API_KEY: string;
		};
	}
}

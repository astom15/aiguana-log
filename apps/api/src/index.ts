import fastify from "fastify";
import cors from "@fastify/cors";
import fastifyEnv from "@fastify/env";
import {
	serializerCompiler,
	validatorCompiler,
	ZodTypeProvider,
} from "fastify-type-provider-zod";
import mongoDbPlugin from "./plugins/mongodb";
import changelogRoutes from "./routes/changelog.routes";
const schema = {
	type: "object",
	required: ["PORT", "CORS_ORIGIN", "MONGODB_URI", "MONGODB_DB_NAME"],
	properties: {
		NODE_ENV: { type: "string", default: "development" },
		PORT: { type: "number", default: 3001 },
		CORS_ORIGIN: { type: "string" },
		MONGODB_URI: { type: "string" },
		MONGODB_DB_NAME: { type: "string" },
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
	await server.register(changelogRoutes, { prefix: "/api/changelogs" });
	server.get("/ping", async (request, reply) => {
		server.log.info(`Ping received. NODE_ENV=${server.config.NODE_ENV}`);
		if (server.mongo) {
			server.log.info("MongoDB connected");
		} else {
			server.log.error("MongoDB not connected");
		}
		return { message: "pong from Fastify API!" };
	});

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

// Define Fastify interface augmentation for type safety (optional but recommended)
// Create a file like src/types/fastify.d.ts if you prefer
declare module "fastify" {
	interface FastifyInstance {
		config: {
			NODE_ENV: string;
			PORT: number;
			CORS_ORIGIN: string;
			MONGODB_URI: string;
			MONGODB_DB_NAME: string;
		};
	}
}

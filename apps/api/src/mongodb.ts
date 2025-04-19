import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";
import { MongoClient, Db } from "mongodb";

// export interface MongoDbPluginOptions {}

export interface FastifyMongoObject {
	client: MongoClient;
	db: Db;
}

async function mongoDbPlugin(
	fastify: FastifyInstance,
	options: FastifyPluginOptions
): Promise<void> {
	const mongoUri = fastify.config.MONGODB_URI;

	if (!mongoUri) {
		fastify.log.error("MONGODB_URI is not defined in the configuration.");
		throw new Error("MONGODB_URI must be defined");
	}

	const dbName = fastify.config.MONGODB_DB_NAME;

	const mongoClient = new MongoClient(mongoUri);

	try {
		await mongoClient.connect();
		fastify.log.info("MongoDB client connected successfully.");

		const db = mongoClient.db(dbName);

		fastify.decorate("mongo", { client: mongoClient, db: db });
		fastify.addHook("onClose", async (instance) => {
			instance.log.info("Closing MongoDB connection...");
			await mongoClient.close();
			instance.log.info("MongoDB connection closed.");
		});
	} catch (err) {
		fastify.log.error("Failed to connect to MongoDB", err);
		if (mongoClient) {
			await mongoClient.close();
		}
		throw err;
	}
}

export default fp(mongoDbPlugin);

declare module "fastify" {
	export interface FastifyInstance {
		mongo: FastifyMongoObject;
	}
}

import OpenAI from "openai";
import fs from "node:fs";
import path from "node:path";
import { ChangelogInput } from "../types/changelog.types";
let promptTemplate = "Error: Could not load prompt template.";
try {
	let baseDir: string;
	if (__filename.includes(path.sep + "dist" + path.sep)) {
		// Running from compiled code in container/deployment
		baseDir = path.join(__dirname, "../../");
		console.log("Detected running from dist, baseDir:", baseDir);
	} else {
		// Running locally via ts-node
		baseDir = path.join(__dirname, "../../../");
		console.log("Detected running from src, baseDir:", baseDir);
	}

	const promptFilePath = path.join(
		baseDir,
		"prompts/generate_changelog.prompt.txt"
	);

	console.log(`Attempting to read prompt from: ${promptFilePath}`);
	promptTemplate = fs.readFileSync(promptFilePath, "utf-8");
	console.log("Prompt template loaded successfully.");
} catch (error) {
	console.error("Error reading prompt file in openai.service.ts:", error);
	console.error(`Current working directory: ${process.cwd()}`);
	console.error(`__dirname: ${__dirname}`);
}

export async function generateChangelog(
	openaiClient: OpenAI,
	input: ChangelogInput
): Promise<{ title: string; summary: string; description: string }> {
	if (promptTemplate.startsWith("Error:")) {
		throw new Error("Prompt template could not be loaded.");
	}
	let prompt = promptTemplate;
	prompt = prompt.replace("{{pr_title}}", input.prTitle || "N/A");
	prompt = prompt.replace("{{pr_body}}", input.prBody || "N/A");
	prompt = prompt.replace("{{code_diff}}", input.codeDiff || "N/A");

	try {
		const completion = await openaiClient.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [{ role: "user", content: prompt }],
			temperature: 0.5,
			max_tokens: 300,
			response_format: { type: "json_object" },
		});

		if (!completion?.choices?.[0]?.message?.content) {
			throw new Error("OpenAI response was incomplete or empty");
		}

		const content = completion.choices[0].message.content;
		if (!content) {
			console.warn("OpenAI response content was empty.");
			throw new Error("AI returned empty content.");
		}
		// TODO: Implement more robust parsing
		try {
			const parsedResponse = JSON.parse(content);
			if (
				typeof parsedResponse.title === "string" &&
				typeof parsedResponse.summary === "string" &&
				typeof parsedResponse.description === "string"
			) {
				return {
					title: parsedResponse.title.trim(),
					summary: parsedResponse.summary.trim(),
					description: parsedResponse.description.trim(),
				};
			} else {
				console.error(
					"Parsed JSON response missing title, summary, or description string fields:",
					parsedResponse
				);
				throw new Error(
					"Parsed JSON response missing title, summary, or description string fields."
				);
			}
		} catch (parseError) {
			console.error(parseError, "Failed to parse JSON response from OpenAI");
			throw new Error("AI returned non-json or malformed content");
		}
	} catch (aiError: any) {
		console.error(aiError, "OpenAI api call failed");
		throw new Error(
			`OpenAI API call failed: ${aiError?.message || "Unknown AI error"}`
		);
	}
}

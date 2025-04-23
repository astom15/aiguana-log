import OpenAI from "openai";
import fs from "node:fs";
import path from "node:path";
import { ChangelogInput } from "../types/changelog.types";
let promptTemplate = "Error: Could not load prompt template.";
// i know this is hacky but its a stopgap
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
): Promise<{ generatedTitle: string; markdownDescription: string }> {
	if (promptTemplate.startsWith("Error:")) {
		throw new Error("Prompt template could not be loaded.");
	}
	let prompt = promptTemplate;
	prompt = prompt.replace("{{pr_title}}", input.prTitle || "N/A");
	prompt = prompt.replace("{{pr_body}}", input.prBody || "N/A");

	try {
		const completion = await openaiClient.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [{ role: "user", content: prompt }],
			temperature: 0.5,
			max_tokens: 400,
			response_format: { type: "json_object" },
		});

		const content = completion.choices[0]?.message?.content;

		if (!content) {
			console.warn("OpenAI response content was empty.");
			throw new Error("AI returned empty content.");
		}

		try {
			const parsedResponse = JSON.parse(content);
			if (
				typeof parsedResponse.generated_title === "string" &&
				typeof parsedResponse.markdown_description === "string"
			) {
				return {
					generatedTitle: parsedResponse.generated_title.trim(),
					markdownDescription: parsedResponse.markdown_description.trim(),
				};
			} else {
				console.error(
					"Parsed JSON response missing generated_title or markdown_description string fields:",
					parsedResponse
				);
				throw new Error(
					"Parsed JSON response missing generated_title or markdown_description string fields."
				);
			}
		} catch (parseError) {
			console.error(
				parseError,
				"Failed to parse JSON response from OpenAI. Content:",
				content
			);
			throw new Error(`AI returned non-JSON or malformed content.`);
		}
	} catch (aiError: any) {
		console.error(aiError, "OpenAI API call failed");
		throw new Error(
			`OpenAI API call failed: ${aiError?.message || "Unknown AI error"}`
		);
	}
}

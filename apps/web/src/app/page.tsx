"use client"; // Necessary for useState, useEffect

import { useState, useEffect } from "react";
import { SerializedChangelogEntry } from "../types/changelog.types";
import { formatDate } from "../utils/date.utils";
import { ApiError } from "../../../shared-types/src";

export default function ChangelogPage() {
	const [changelogs, setChangelogs] = useState<SerializedChangelogEntry[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const apiUrl = process.env.NEXT_PUBLIC_API_URL;
		if (!apiUrl) {
			setError("API URL environment variable is not configured.");
			setIsLoading(false);
			return;
		}

		const fetchChangelogs = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const response = await fetch(`${apiUrl}/changelogs`);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const data: SerializedChangelogEntry[] = await response.json();
				setChangelogs(data);
			} catch (e) {
				console.error("Failed to fetch changelogs:", e);
				const error = e as ApiError;
				setError(error.message || "Failed to load changelogs.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchChangelogs();
	}, []);

	return (
		<main className="flex min-h-screen flex-col items-center p-8 md:p-16 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
			<h1 className="text-4xl font-bold mb-8">Changelog</h1>

			{isLoading && (
				<p className="text-lg text-gray-500 dark:text-gray-400">
					Loading entries...
				</p>
			)}

			{error && (
				<p className="text-lg text-red-600 dark:text-red-400">Error: {error}</p>
			)}

			{!isLoading && !error && (
				<div className="w-full max-w-4xl space-y-6">
					{changelogs.length === 0 ? (
						<p className="text-center text-gray-500 dark:text-gray-400">
							No published changelog entries found.
						</p>
					) : (
						changelogs.map((entry: SerializedChangelogEntry) => (
							<div
								key={entry._id}
								className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
							>
								<h2 className="text-2xl font-semibold mb-2">
									{entry.title ?? "Untitled"}
								</h2>
								{entry.generatedAt && (
									<p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
										Published on: {formatDate(entry.generatedAt)}
									</p>
								)}
								<p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4">
									{entry.description ?? "No description."}
								</p>
								<div className="flex flex-wrap gap-2">
									{entry.breaking_change && (
										<span className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300 border border-red-400">
											Breaking Change
										</span>
									)}
									{entry.tags?.map((tag: string) => (
										<span
											key={tag}
											className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 border border-blue-400"
										>
											{tag}
										</span>
									))}
								</div>
							</div>
						))
					)}
				</div>
			)}
		</main>
	);
}

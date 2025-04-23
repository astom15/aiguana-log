"use client";
import { useState, useEffect } from "react";
import { SerializedChangelogEntry } from "../types/changelog.types";
import { formatDate } from "../utils/date.utils";

const TagIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-3 w-3 mr-1 inline-block"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={2}
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M7 7h.01M7 3h5c.53 0 1.04.21 1.41.59L18 8.17a2 2 0 010 2.83l-5 5a2 2 0 01-2.83 0L5.59 11.41A2 2 0 015 10.59V5a2 2 0 012-2zm0 0a2 2 0 00-2 2v5.59a2 2 0 00.59 1.41l5 5a2 2 0 002.83 0l5-5a2 2 0 000-2.83L13.41 3.59A2 2 0 0012.59 3H7z"
		/>
	</svg>
);
const AlertTriangleIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-3 w-3 mr-1 inline-block"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		strokeWidth={2}
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4.977a2 2 0 00-3.464 0L3.34 16.977c-.77 1.333.192 3 1.732 3z"
		/>
	</svg>
);

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
					let errorMsg = `HTTP error! status: ${response.status}`;
					try {
						const errorData = await response.json();
						errorMsg = errorData.message || errorMsg;
					} catch {
						/* Ignore */
					}
					throw new Error(errorMsg);
				}
				const data: SerializedChangelogEntry[] = await response.json();
				setChangelogs(data);
			} catch (e: unknown) {
				if (e instanceof Error) {
					console.error("Failed to fetch changelogs:", e);
					setError(e.message || "Failed to load changelogs.");
				} else {
					setError("An unknown error occurred.");
				}
			} finally {
				setIsLoading(false);
			}
		};

		fetchChangelogs();
	}, []);

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
			<main className="max-w-3xl mx-auto">
				<h1 className="text-center text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-green-100 mb-10 tracking-tight">
					Aiguana Changelog
				</h1>

				{isLoading && (
					<div className="text-center py-10">
						<svg
							className="animate-spin h-8 w-8 text-green-600 dark:text-green-400 mx-auto"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							></circle>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						<p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
							Loading entries...
						</p>
					</div>
				)}

				{error && (
					<div
						className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative text-center"
						role="alert"
					>
						<strong className="font-bold">Error:</strong>
						<span className="block sm:inline ml-2">{error}</span>
					</div>
				)}

				{!isLoading && !error && (
					<div className="space-y-8">
						{changelogs.length === 0 ? (
							<div className="text-center py-10">
								<p className="text-xl text-gray-500 dark:text-gray-400">
									No published changelog entries found.
								</p>
								<p className="text-gray-400 dark:text-gray-500 mt-2">
									Check back later for updates!
								</p>
							</div>
						) : (
							changelogs.map((entry: SerializedChangelogEntry) => (
								<article
									key={entry._id}
									className="bg-white dark:bg-neutral-800 p-6 sm:p-8 rounded-xl shadow-md dark:shadow-lg ring-1 ring-inset ring-zinc-100 dark:ring-white/10 transition hover:shadow-lg hover:shadow-green-100 dark:hover:shadow-green-900/30 hover:ring-zinc-200 dark:hover:ring-white/20"
								>
									<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
										<h2 className="text-2xl font-semibold text-gray-800 dark:text-green-100 mb-2 sm:mb-0">
											{entry.title ?? "Untitled"}
										</h2>
										{entry.generatedAt && (
											<p className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
												{formatDate(entry.generatedAt)}
											</p>
										)}
									</div>
									<div className="prose prose-green dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 mb-5">
										<p>{entry.description ?? "No summary provided."}</p>
									</div>
									<div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
										{entry.breaking_change && (
											<span className="flex items-center bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300 border border-red-300 dark:border-red-600">
												<AlertTriangleIcon /> Breaking Change
											</span>
										)}
										{entry.tags?.map((tag: string) => (
											<span
												key={tag}
												className="flex items-center bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300 border border-green-300 dark:border-green-600"
											>
												<TagIcon /> {tag}
											</span>
										))}
									</div>
								</article>
							))
						)}
					</div>
				)}
			</main>
		</div>
	);
}

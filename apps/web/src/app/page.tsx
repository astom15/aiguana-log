"use client"; // Make this a Client Component

import { useState, useEffect } from "react";

export default function Home() {
	const [apiMessage, setApiMessage] = useState<string>("Loading API data...");

	useEffect(() => {
		fetch("http://localhost:3001/ping")
			.then((response) => {
				if (!response.ok) {
					throw new Error(
						`Network response was not ok: ${response.statusText}`
					);
				}
				return response.json();
			})
			.then((data) => {
				setApiMessage(data.message || "No message received");
			})
			.catch((error) => {
				console.error("Error fetching data:", error);
				setApiMessage(`Failed to load API data: ${error.message}`);
			});
	}, []);

	return (
		<main className="flex min-h-screen flex-col items-center justify-center p-24">
			<h1 className="text-4xl font-bold mb-8">Welcome to the Monorepo App!</h1>
			<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
				<h2 className="text-2xl font-semibold mb-4">
					Message from Backend API:
				</h2>
				<p className="text-lg text-gray-700 dark:text-gray-300">{apiMessage}</p>
			</div>
		</main>
	);
}

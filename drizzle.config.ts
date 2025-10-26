import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	throw new Error("Environment variable DATABASE_URL is not set.");
}

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/lib/db/schema.ts",
	out: "./drizzle",
	dbCredentials: {
		url: databaseUrl,
	},
});

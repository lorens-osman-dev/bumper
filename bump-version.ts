import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

type ManifestType = {
	name: string;
	version: string;
	minAppVersion: string;
	author: string;
	authorUrl: string;
	fundingUrl: string;
};

function bumpVersion(
	version: string,
	type: "major" | "minor" | "patch" = "patch",
): string {
	const [major, minor, patch] = version.split(".").map(Number);

	switch (type) {
		case "major":
			return `${major + 1}.0.0`;
		case "minor":
			return `${major}.${minor + 1}.0`;
		case "patch":
			return `${major}.${minor}.${patch + 1}`;
		default:
			throw new Error("Invalid version bump type");
	}
}

async function main() {
	try {
		// Read the current manifest
		const manifestPath = "./manifest.json";
		const manifestContent = readFileSync(manifestPath, "utf-8");
		const manifest: ManifestType = JSON.parse(manifestContent);

		// Get the current version and bump it
		const currentVersion = manifest.version;
		const newVersion = bumpVersion(currentVersion);

		// Update manifest with new version
		manifest.version = newVersion;
		writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

		console.log(`Version bumped from ${currentVersion} to ${newVersion}`);

		// Create git tag
		execSync(`git add ${manifestPath}`);
		execSync(`git commit -m "chore: bump version to ${newVersion}"`);
		execSync(`git tag v${newVersion}`);

		// // Push changes and tags to GitHub
		// execSync("git push");
		// execSync("git push --tags");

		console.log("Successfully created and pushed git tag");
	} catch (error) {
		console.error("Error:", error);
		process.exit(1);
	}
}

// Run the script
main();

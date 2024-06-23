import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),

			"@ui-kit": path.resolve(__dirname, "./src/kit/ui"),
			"@utils": path.resolve(__dirname, "./utils.ts"),
			"@wails": path.resolve(__dirname, "./wailsjs/go"),
			"@runtime": path.resolve(__dirname, "./wailsjs/runtime"),
		},
	},
});

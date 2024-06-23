import "./App.css";
import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	Label,
	Toaster,
	ToggleGroup,
	ToggleGroupItem,
	useToast,
} from "@ui-kit";
import { useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { Command } from "@tauri-apps/plugin-shell";
import { ReloadIcon } from "@radix-ui/react-icons";

function App() {
	const [filePath, setFilePath] = useState<string>();
	const [outputFilePath, setOutputFilePath] = useState<string>();
	const [compressionType, setCompressionType] = useState<"default" | "super">(
		"default",
	);
	const [loading, setLoading] = useState(false);
	const { toast } = useToast();

	const onClick = async () => {
		try {
			const file = await open({
				multiple: false,
				directory: false,
				filters: [
					{
						name: "MP4 Video (*.mp4)",
						extensions: ["mp4"],
					},
				],
			});
			if (!file) return;

			const fileSplitted = file.path.split(".");
			const fileName = fileSplitted[0];
			const fileExt = fileSplitted[1];
			const outputFilename = fileName + "-compressed." + fileExt;
			setFilePath(file.path);
			setOutputFilePath(outputFilename);
		} catch (e) {
			console.log({ e });
		}
	};
	const onSubmit = async () => {
		if (!filePath || !outputFilePath) return;
		try {
			const command = Command.sidecar("binaries/ffmpeg", [
				"-i",
				filePath,
				"-vcodec",
				compressionType === "super" ? "libx265" : "h264",
				compressionType === "super" ? "-crf" : "-acodec",
				compressionType === "super" ? "28" : "mp2",
				outputFilePath,
			]);
			setLoading(true);
			await command.execute();
			toast({
				title: "Your video compressed successfully!",
				description: `File: ${outputFilePath}`,
				variant: "default",
			});
		} catch (e) {
			console.log({ e });
			toast({
				title: "Something went wrong!",
				description: e as string,
				variant: "destructive",
			});
		} finally {
			setLoading(false);
			onCancel();
		}
	};
	const onCancel = () => {
		setOutputFilePath(undefined);
		setFilePath(undefined);
		setCompressionType("default");
	};
	return (
		<section
			style={{
				width: "100svw",
				height: "100svh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<Toaster />
			<Card className="w-[350px]">
				<CardHeader>
					<CardTitle>Compress your video</CardTitle>
					<CardDescription>
						Select a video you want to compress.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid w-full items-center gap-4">
						<div className="flex flex-col space-y-3">
							<div className="flex flex-col space-y-1 w-full mb-2">
								<Label className="!w-full !mb-2 text-center">
									Comression type
								</Label>
								<ToggleGroup
									type="single"
									value={compressionType}
									variant="outline"
								>
									<ToggleGroupItem value="default" aria-label="Toggle default">
										Default
									</ToggleGroupItem>
									<ToggleGroupItem value="super" aria-label="Toggle outline">
										Super
									</ToggleGroupItem>
								</ToggleGroup>
							</div>
							<div className="w-full">
								{filePath || (
									<Button
										width="full"
										type="button"
										variant="secondary"
										onClick={onClick}
									>
										Select Video
									</Button>
								)}
							</div>
						</div>
					</div>
				</CardContent>
				<CardFooter className="flex justify-between">
					{!loading ? (
						<>
							<Button type="button" variant="outline" onClick={onCancel}>
								Cancel
							</Button>
							<Button onClick={onSubmit} type="submit">
								Compress
							</Button>
						</>
					) : (
						<Button disabled>
							<ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
							Please wait
						</Button>
					)}
				</CardFooter>
			</Card>
		</section>
	);
}

export default App;

import "./App.css";
import {
	Badge,
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
import {
	isPermissionGranted,
	requestPermission,
	sendNotification,
} from "@tauri-apps/plugin-notification";
import { ReloadIcon } from "@radix-ui/react-icons";
import { listen } from "@tauri-apps/api/event";

type DropEvent = {
	payload: {
		paths?: string[];
		position?: {
			x: number;
			y: number;
		};
	};
};

function App() {
	const [filePath, setFilePath] = useState<string>();
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
			setFilePath(file.path);
		} catch (e) {
			console.log({ e });
		}
	};
	const onSubmit = async (ev: any) => {
		ev.preventDefault();
		if (!filePath) return;
		try {
			const fileSplitted = filePath.split(".");
			const fileName = fileSplitted[0];
			const fileExt = fileSplitted[1];
			const outputFilename =
				fileName +
				`${compressionType === "super" ? "-super-compressed" : "-compressed"}.` +
				fileExt;

			const command = Command.sidecar("binaries/ffmpeg", [
				"-i",
				filePath,
				"-vcodec",
				compressionType === "super" ? "libx265" : "h264",
				compressionType === "super" ? "-crf" : "-acodec",
				compressionType === "super" ? "28" : "mp2",
				outputFilename!,
			]);
			setLoading(true);
			await command.execute();

			notify(outputFilename);
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
		setFilePath(undefined);
		setCompressionType("default");
	};
	const notify = async (path: string) => {
		let permissionGranted = await isPermissionGranted();

		// If not we need to request it
		if (!permissionGranted) {
			const permission = await requestPermission();
			permissionGranted = permission === "granted";
		}

		// Once permission has been granted we can send the notification
		if (permissionGranted) {
			sendNotification({ title: "Compression done!", body: `File: ${path}!` });
		}
	};

	useEffect(() => {
		const unListen = listen("tauri://drop", (event: DropEvent) => {
			if (event && event.payload && event.payload.paths)
				setFilePath(event.payload.paths[0]);
		});
		return () => {
			unListen.then();
		};
	}, []);
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
			<Card className="w-5/6 max-w-[400px]">
				<CardHeader>
					<CardTitle className="text-center">Compress your video</CardTitle>
					<CardDescription className="text-center">
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
									disabled={loading}
									type="single"
									value={compressionType}
									onValueChange={(val) =>
										setCompressionType(val as "default" | "super")
									}
									variant="outline"
								>
									<ToggleGroupItem
										disabled={loading}
										value="default"
										aria-label="Toggle default"
									>
										Default
									</ToggleGroupItem>
									<ToggleGroupItem
										disabled={loading}
										value="super"
										aria-label="Toggle outline"
									>
										Super
									</ToggleGroupItem>
								</ToggleGroup>
							</div>
							<div className="w-full flex items-center justify-center">
								{filePath ? (
									<Badge variant="secondary">{filePath}</Badge>
								) : (
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
				<CardFooter className="flex mt-auto justify-between">
					<Button
						disabled={loading}
						type="button"
						variant="outline"
						onClick={onCancel}
					>
						Cancel
					</Button>
					<Button disabled={loading} onClick={onSubmit} type="submit">
						{loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
						Compress
					</Button>
				</CardFooter>
			</Card>
		</section>
	);
}

export default App;

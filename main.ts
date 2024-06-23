import { app, BrowserWindow } from "electron";
import * as path from "path";
import { execFile } from "child_process";

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      // enableRemoteModule: false,
    },
  });

  mainWindow.loadURL("http://localhost:5173");
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function getFFmpegPath() {
  let ffmpegPath: string;
  switch (process.platform) {
    case "win32":
      ffmpegPath = path.join(
        __dirname,
        "assets",
        "ffmpeg",
        "windows",
        "bin",
        "ffmpeg.exe",
      );
      break;
    case "darwin":
      ffmpegPath = path.join(__dirname, "assets", "ffmpeg", "macos", "ffmpeg");
      break;
    case "linux":
      ffmpegPath = path.join(__dirname, "assets", "ffmpeg", "linux", "ffmpeg");
      break;
    default:
      throw new Error("Unsupported platform: " + process.platform);
  }
  return ffmpegPath;
}

function runFFmpeg() {
  const ffmpegPath = getFFmpegPath();
  execFile(ffmpegPath, ["-version"], (error, stdout, stderr) => {
    if (error) {
      console.error("Error executing ffmpeg:", error);
      return;
    }
    console.log("FFmpeg output:", stdout);
  });
}

app.on("ready", runFFmpeg);

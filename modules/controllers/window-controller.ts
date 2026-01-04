import { BrowserWindow, ipcMain, WebContents, shell, session } from "electron";

export class WindowController {
  public intervals: any[] = [];

  public get webContents(): WebContents | undefined {
    return this.win?.webContents;
  }

  public get isDestroyed(): boolean {
    return this.win == null || this.win.isDestroyed();
  }

  // Set the progress bar to the given percentage. It will be shown in task bar
  public setProgress(progress: number) {
    this.win?.setProgressBar(progress != 0 ? progress : -1);
  }

  unmaximize() {
    this.win?.unmaximize();
  }

  reload() {
    this.win?.reload();
  }

  constructor(public win: BrowserWindow | null) {
    this.setUserAgent();
    this.destoryWhenExit();
    this.listenFullScreen();
    this.registerDeepLinks();
    this.setOpenHandler();

    try {
      session.defaultSession.clearCache();
      this.win?.webContents?.session.clearCache();
    } catch (e) {
      console.error("Failed to clear cache", e);
    }
  }

  // Register deep links for the app.
  registerDeepLinks() {
    const win = this.win;
    if (win) {
    }
  }

  minimize() {
    this.win?.minimize();
  }

  public isMaximized() {
    return this.win?.isMaximized();
  }

  maximize() {
    this.win?.maximize();
  }

  listenFullScreen() {
    this.win?.on("enter-full-screen", () => {
      if (this.win != null) {
        this.win.setMenuBarVisibility(false);
      }
    });

    this.win?.on("leave-full-screen", () => {
      if (this.win != null) {
        this.win.setMenuBarVisibility(true);
      }
    });
  }

  destoryWhenExit() {
    ipcMain.on("exit", (event) => {
      this.win?.close();
      this.intervals.forEach((element) => {
        clearInterval(element);
      });
    });
  }

  // public currentFrameUrl: string | null = null;
  // Kept for compatibility if used elsewhere, but ideally remove if unused. 
  // Main.ts doesn't seem to use it directly, but let's check. 
  // RequestController used it for Referer, but we removed that usage.
  public currentFrameUrl: string | null = null;

  public sendToWebContents(key: string, ...data: any) {
    if (this.win != null && !this.win.isDestroyed()) {
      this.win.webContents.send(key, ...data);
    }
  }

  public sendToFrame(key: string, ...data: any) {
    if (!this.win?.isDestroyed()) {
      this.win?.webContents?.mainFrame.frames.forEach((frame) => {
        frame.send(key, ...data);
      });
    }
  }

  public destroy() {
    this.win = null;
  }

  public loadURL(url: string) {
    if (this.win != null && !this.win.isDestroyed()) {
      this.win.webContents.loadURL(url);
    }
  }

  public setUserAgent() {
    if (this.win != null) {
      this.win.webContents.on("did-create-window", (window) => {
        window.webContents.setUserAgent(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:70.0) Gecko/20100101 Firefox/70.0"
        );
      });
    }
  }

  public setOpenHandler() {
    if (this.win != null) {
      ipcMain.on("openLink", (event, link: string) => {
        if (!link.startsWith("http")) {
          link = process.env.APP_URL + "/" + link;
        }
        console.log(link);
        shell.openExternal(link);
      });

      this.win.webContents.setWindowOpenHandler((details) => {
        // Allow external links to open in browser
        if (!details.url.includes("music.youtube.com")) {
          shell.openExternal(details.url);
          return { action: "deny" };
        }
        return { action: "allow" };
      });
    }
  }
}

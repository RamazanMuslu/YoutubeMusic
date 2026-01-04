import { BrowserWindow, app, Menu, shell, dialog } from "electron";
import path from "path";
import { WindowController } from "./controllers/window-controller";
import { RequestController } from "./controllers/request-controller";
import { RpcController } from "./controllers/rpc-controller";

export class Main {
  win: WindowController | null = null;

  constructor(public dir: any) { }

  run() {
    const gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
      app.quit();
    } else {
      app.whenReady().then(() => {
        // app.setAppUserModelId("YouTube Music"); // Update ID if needed
        const win = new BrowserWindow({
          show: false,
          backgroundColor: "#1D1D1D",
          title: "YouTube Music",
          icon: path.join(this.dir, "files", "icon.png"),
          frame: true,
          webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            nodeIntegrationInSubFrames: true,
            preload: this.dir + "/files/preload.js",
          },
        });
        this.win = new WindowController(win);

        this.createMenu();

        win.minimize();
        win.setProgressBar(100);
        win.on("ready-to-show", () => {
          win.maximize();
          win.show();
          win.setProgressBar(-1);
        });

        win.webContents.on("did-finish-load", () => {
        });

        // Setup the Adblock and rewrite necessary headers
        const requestController = new RequestController(this.win);
        requestController.execute();

        // Discord RPC
        const rpcController = new RpcController(this.win);
        rpcController.execute();

        win.loadURL(process.env.APP_URL as string);
      });
    }
  }
  createMenu() {
    const isMac = process.platform === "darwin";

    const template: any[] = [
      {
        label: 'Yenile',
        click: () => {
          this.win?.reload();
        }
      },
      {
        label: 'Hakkında',
        click: () => {
          const aboutWin = new BrowserWindow({
            width: 400,
            height: 450,
            title: "Hakkında",
            icon: path.join(this.dir, "files", "icon.png"),
            autoHideMenuBar: true,
            webPreferences: {
              nodeIntegration: true,
              contextIsolation: false
            },
            resizable: false,
            minimizable: false,
            maximizable: false
          });
          aboutWin.loadFile(path.join(this.dir, "files", "about.html"));
        }
      }
    ];

    if (isMac) {
      template.unshift({
        label: app.name,
        submenu: [
          { role: "about" },
          { type: "separator" },
          { role: "services" },
          { type: "separator" },
          { role: "hide" },
          { role: "hideOthers" },
          { role: "unhide" },
          { type: "separator" },
          { role: "quit" },
        ],
      });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
}

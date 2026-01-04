import { ipcMain } from "electron";
import { Client } from "@xhayper/discord-rpc";
import { WindowController } from "./window-controller";

export class RpcController {
  private readonly client: Client;
  private isConnected: boolean = false;

  constructor(private win: WindowController) {
    this.client = new Client({
      clientId: "1328090528369348608", // We might need a new client ID for YTM
    });

    //try to connect
    this.client.once("ready", () => {
      this.isConnected = true;
      this.setIdleActivity(); // idle
    });

    //if cannot connect, throw an error
    this.client.login().catch((err) => {
      console.error("Discord RPC bağlanılamadı :", err.message);
      this.isConnected = false;
    });
  }

  private setIdleActivity() {
    if (!this.isConnected) return;
    const idleActivity = {
      state: "Browsing Music",
      largeImageKey: "youtube-music",
      largeImageText: "YouTube Music",
      type: 3, // Listening?
    };
    this.client.user?.setActivity(idleActivity).catch(console.error);
  }

  public execute(): void {
    ipcMain.on("discord-rpc", (event, data) => {
      if (!this.isConnected) {
        return;
      }

      const watchingActivity = {
        details: data.details, // Song Name
        state: data.state,     // Artist Name
        startTimestamp: Date.now(),
        largeImageKey: data.largeImageKey || "youtube-music",
        largeImageText: "YouTube Music",
        type: 2, // Listening to
      };

      this.client.user?.setActivity(watchingActivity).catch(console.error);
    });

    ipcMain.on("discord-rpc-destroy", () => {
      this.setIdleActivity();
    });
  }

  public destroy(): void {
    if (!this.isConnected) return;
    this.client.user?.clearActivity().catch(console.error);
  }
}
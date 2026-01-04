"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RpcController = void 0;
var electron_1 = require("electron");
var discord_rpc_1 = require("@xhayper/discord-rpc");
var RpcController = /** @class */ (function () {
    function RpcController(win) {
        var _this = this;
        this.win = win;
        this.isConnected = false;
        this.client = new discord_rpc_1.Client({
            clientId: "1328090528369348608", // We might need a new client ID for YTM
        });
        //try to connect
        this.client.once("ready", function () {
            _this.isConnected = true;
            _this.setIdleActivity(); // idle
        });
        //if cannot connect, throw an error
        this.client.login().catch(function (err) {
            console.error("Discord RPC bağlanılamadı :", err.message);
            _this.isConnected = false;
        });
    }
    RpcController.prototype.setIdleActivity = function () {
        var _a;
        if (!this.isConnected)
            return;
        var idleActivity = {
            state: "Browsing Music",
            largeImageKey: "youtube-music",
            largeImageText: "YouTube Music",
            type: 3, // Listening?
        };
        (_a = this.client.user) === null || _a === void 0 ? void 0 : _a.setActivity(idleActivity).catch(console.error);
    };
    RpcController.prototype.execute = function () {
        var _this = this;
        electron_1.ipcMain.on("discord-rpc", function (event, data) {
            var _a;
            if (!_this.isConnected) {
                return;
            }
            var watchingActivity = {
                details: data.details,
                state: data.state,
                startTimestamp: Date.now(),
                largeImageKey: data.largeImageKey || "youtube-music",
                largeImageText: "YouTube Music",
                type: 2, // Listening to
            };
            (_a = _this.client.user) === null || _a === void 0 ? void 0 : _a.setActivity(watchingActivity).catch(console.error);
        });
        electron_1.ipcMain.on("discord-rpc-destroy", function () {
            _this.setIdleActivity();
        });
    };
    RpcController.prototype.destroy = function () {
        var _a;
        if (!this.isConnected)
            return;
        (_a = this.client.user) === null || _a === void 0 ? void 0 : _a.clearActivity().catch(console.error);
    };
    return RpcController;
}());
exports.RpcController = RpcController;

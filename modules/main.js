"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Main = void 0;
var electron_1 = require("electron");
var path_1 = __importDefault(require("path"));
var window_controller_1 = require("./controllers/window-controller");
var request_controller_1 = require("./controllers/request-controller");
var rpc_controller_1 = require("./controllers/rpc-controller");
var Main = /** @class */ (function () {
    function Main(dir) {
        this.dir = dir;
        this.win = null;
    }
    Main.prototype.run = function () {
        var _this = this;
        var gotTheLock = electron_1.app.requestSingleInstanceLock();
        if (!gotTheLock) {
            electron_1.app.quit();
        }
        else {
            electron_1.app.whenReady().then(function () {
                // app.setAppUserModelId("YouTube Music"); // Update ID if needed
                var win = new electron_1.BrowserWindow({
                    show: false,
                    backgroundColor: "#1D1D1D",
                    title: "YouTube Music",
                    icon: path_1.default.join(_this.dir, "files", "icon.png"),
                    frame: true,
                    webPreferences: {
                        nodeIntegration: true,
                        contextIsolation: false,
                        nodeIntegrationInSubFrames: true,
                        preload: _this.dir + "/files/preload.js",
                    },
                });
                _this.win = new window_controller_1.WindowController(win);
                _this.createMenu();
                win.minimize();
                win.setProgressBar(100);
                win.on("ready-to-show", function () {
                    win.maximize();
                    win.show();
                    win.setProgressBar(-1);
                });
                win.webContents.on("did-finish-load", function () {
                });
                // Setup the Adblock and rewrite necessary headers
                var requestController = new request_controller_1.RequestController(_this.win);
                requestController.execute();
                // Discord RPC
                var rpcController = new rpc_controller_1.RpcController(_this.win);
                rpcController.execute();
                win.loadURL(process.env.APP_URL);
            });
        }
    };
    Main.prototype.createMenu = function () {
        var _this = this;
        var isMac = process.platform === "darwin";
        var template = [
            {
                label: 'Yenile',
                click: function () {
                    var _a;
                    (_a = _this.win) === null || _a === void 0 ? void 0 : _a.reload();
                }
            },
            {
                label: 'Hakkında',
                click: function () {
                    var aboutWin = new electron_1.BrowserWindow({
                        width: 400,
                        height: 450,
                        title: "Hakkında",
                        icon: path_1.default.join(_this.dir, "files", "icon.png"),
                        autoHideMenuBar: true,
                        webPreferences: {
                            nodeIntegration: true,
                            contextIsolation: false
                        },
                        resizable: false,
                        minimizable: false,
                        maximizable: false
                    });
                    aboutWin.loadFile(path_1.default.join(_this.dir, "files", "about.html"));
                }
            }
        ];
        if (isMac) {
            template.unshift({
                label: electron_1.app.name,
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
        var menu = electron_1.Menu.buildFromTemplate(template);
        electron_1.Menu.setApplicationMenu(menu);
    };
    return Main;
}());
exports.Main = Main;

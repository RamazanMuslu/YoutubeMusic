"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowController = void 0;
var electron_1 = require("electron");
var WindowController = /** @class */ (function () {
    function WindowController(win) {
        var _a, _b;
        this.win = win;
        this.intervals = [];
        // public currentFrameUrl: string | null = null;
        // Kept for compatibility if used elsewhere, but ideally remove if unused. 
        // Main.ts doesn't seem to use it directly, but let's check. 
        // RequestController used it for Referer, but we removed that usage.
        this.currentFrameUrl = null;
        this.setUserAgent();
        this.destoryWhenExit();
        this.listenFullScreen();
        this.registerDeepLinks();
        this.setOpenHandler();
        try {
            electron_1.session.defaultSession.clearCache();
            (_b = (_a = this.win) === null || _a === void 0 ? void 0 : _a.webContents) === null || _b === void 0 ? void 0 : _b.session.clearCache();
        }
        catch (e) {
            console.error("Failed to clear cache", e);
        }
    }
    Object.defineProperty(WindowController.prototype, "webContents", {
        get: function () {
            var _a;
            return (_a = this.win) === null || _a === void 0 ? void 0 : _a.webContents;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WindowController.prototype, "isDestroyed", {
        get: function () {
            return this.win == null || this.win.isDestroyed();
        },
        enumerable: false,
        configurable: true
    });
    // Set the progress bar to the given percentage. It will be shown in task bar
    WindowController.prototype.setProgress = function (progress) {
        var _a;
        (_a = this.win) === null || _a === void 0 ? void 0 : _a.setProgressBar(progress != 0 ? progress : -1);
    };
    WindowController.prototype.unmaximize = function () {
        var _a;
        (_a = this.win) === null || _a === void 0 ? void 0 : _a.unmaximize();
    };
    WindowController.prototype.reload = function () {
        var _a;
        (_a = this.win) === null || _a === void 0 ? void 0 : _a.reload();
    };
    // Register deep links for the app.
    WindowController.prototype.registerDeepLinks = function () {
        var win = this.win;
        if (win) {
        }
    };
    WindowController.prototype.minimize = function () {
        var _a;
        (_a = this.win) === null || _a === void 0 ? void 0 : _a.minimize();
    };
    WindowController.prototype.isMaximized = function () {
        var _a;
        return (_a = this.win) === null || _a === void 0 ? void 0 : _a.isMaximized();
    };
    WindowController.prototype.maximize = function () {
        var _a;
        (_a = this.win) === null || _a === void 0 ? void 0 : _a.maximize();
    };
    WindowController.prototype.listenFullScreen = function () {
        var _this = this;
        var _a, _b;
        (_a = this.win) === null || _a === void 0 ? void 0 : _a.on("enter-full-screen", function () {
            if (_this.win != null) {
                _this.win.setMenuBarVisibility(false);
            }
        });
        (_b = this.win) === null || _b === void 0 ? void 0 : _b.on("leave-full-screen", function () {
            if (_this.win != null) {
                _this.win.setMenuBarVisibility(true);
            }
        });
    };
    WindowController.prototype.destoryWhenExit = function () {
        var _this = this;
        electron_1.ipcMain.on("exit", function (event) {
            var _a;
            (_a = _this.win) === null || _a === void 0 ? void 0 : _a.close();
            _this.intervals.forEach(function (element) {
                clearInterval(element);
            });
        });
    };
    WindowController.prototype.sendToWebContents = function (key) {
        var _a;
        var data = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            data[_i - 1] = arguments[_i];
        }
        if (this.win != null && !this.win.isDestroyed()) {
            (_a = this.win.webContents).send.apply(_a, __spreadArray([key], data, false));
        }
    };
    WindowController.prototype.sendToFrame = function (key) {
        var _a, _b, _c;
        var data = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            data[_i - 1] = arguments[_i];
        }
        if (!((_a = this.win) === null || _a === void 0 ? void 0 : _a.isDestroyed())) {
            (_c = (_b = this.win) === null || _b === void 0 ? void 0 : _b.webContents) === null || _c === void 0 ? void 0 : _c.mainFrame.frames.forEach(function (frame) {
                frame.send.apply(frame, __spreadArray([key], data, false));
            });
        }
    };
    WindowController.prototype.destroy = function () {
        this.win = null;
    };
    WindowController.prototype.loadURL = function (url) {
        if (this.win != null && !this.win.isDestroyed()) {
            this.win.webContents.loadURL(url);
        }
    };
    WindowController.prototype.setUserAgent = function () {
        if (this.win != null) {
            this.win.webContents.on("did-create-window", function (window) {
                window.webContents.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:70.0) Gecko/20100101 Firefox/70.0");
            });
        }
    };
    WindowController.prototype.setOpenHandler = function () {
        if (this.win != null) {
            electron_1.ipcMain.on("openLink", function (event, link) {
                if (!link.startsWith("http")) {
                    link = process.env.APP_URL + "/" + link;
                }
                console.log(link);
                electron_1.shell.openExternal(link);
            });
            this.win.webContents.setWindowOpenHandler(function (details) {
                // Allow external links to open in browser
                if (!details.url.includes("music.youtube.com")) {
                    electron_1.shell.openExternal(details.url);
                    return { action: "deny" };
                }
                return { action: "allow" };
            });
        }
    };
    return WindowController;
}());
exports.WindowController = WindowController;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeeplinkController = void 0;
var electron_1 = require("electron");
var path_1 = __importDefault(require("path"));
var DeeplinkController = /** @class */ (function () {
    function DeeplinkController(win, authController) {
        this.win = win;
        this.authController = authController;
    }
    DeeplinkController.prototype.execute = function () {
        var _this = this;
        if (this.win.win) {
            var win_1 = this.win.win;
            if (process.defaultApp) {
                if (process.argv.length >= 2) {
                    electron_1.app.setAsDefaultProtocolClient("animecix", process.execPath, [
                        path_1.default.resolve(process.argv[1]),
                    ]);
                }
            }
            else {
                electron_1.app.setAsDefaultProtocolClient("animecix");
            }
            electron_1.app.on("open-url", function (event, url) {
                if (url !== undefined) {
                    if (url.includes("animecix://login")) {
                        _this.authController.onLinkReceived(url);
                    }
                    else {
                        win_1.loadURL(url.replace("animecix://", "https://"));
                    }
                }
            });
            electron_1.app.on("second-instance", function (event, commandLine, workingDirectory) {
                // Someone tried to run a second instance, we should focus our window.
                var url = commandLine.find(function (item) {
                    return item.includes("animecix://");
                });
                if (url !== undefined) {
                    if (url.includes("animecix://login")) {
                        _this.authController.onLinkReceived(url);
                    }
                    else {
                        var urll = new URL(process.env.APP_URL);
                        urll.pathname = url.replace("animecix://", "");
                        win_1.loadURL(urll.href);
                    }
                }
                if (win_1.isMinimized())
                    win_1.restore();
                win_1.focus();
            });
        }
    };
    return DeeplinkController;
}());
exports.DeeplinkController = DeeplinkController;

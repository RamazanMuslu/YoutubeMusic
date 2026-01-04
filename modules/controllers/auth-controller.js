"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
var AuthController = /** @class */ (function () {
    function AuthController(win) {
        this.win = win;
        this.authCookie = null;
    }
    AuthController.prototype.onLinkReceived = function (link) {
        try {
            link = decodeURIComponent(link);
            var status_1 = link.split("{")[1].split("|")[0];
            var data = link.split("|")[1].split("}")[0];
            this.win.loadURL(process.env.APP_URL + "/secure/short-login/" + data);
        }
        catch (e) {
            console.log(e);
        }
    };
    return AuthController;
}());
exports.AuthController = AuthController;

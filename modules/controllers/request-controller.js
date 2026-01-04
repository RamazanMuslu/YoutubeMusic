"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestController = void 0;
var adblocker_electron_1 = require("@cliqz/adblocker-electron");
var electron_1 = require("electron");
var RequestController = /** @class */ (function () {
    function RequestController(win) {
        this.win = win;
        this.blocker = null;
        this.filter = {
            urls: ["*://*/*"],
        };
    }
    RequestController.prototype.execute = function () {
        this.setupAdblock();
        this.listenHeaders();
        this.listenRequests();
    };
    RequestController.prototype.setupAdblock = function () {
        var _this = this;
        adblocker_electron_1.ElectronBlocker.fromPrebuiltAdsAndTracking(require("node-fetch")).then(function (blocker) {
            _this.blocker = blocker;
        });
    };
    RequestController.prototype.listenHeaders = function () {
        electron_1.session.defaultSession.webRequest.onBeforeSendHeaders(this.filter, function (details, callback) {
            details.requestHeaders["User-Agent"] =
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:70.0) Gecko/20100101 Firefox/70.0";
            callback({ requestHeaders: details.requestHeaders });
        });
    };
    RequestController.prototype.listenRequests = function () {
        var _this = this;
        electron_1.session.defaultSession.webRequest.onBeforeRequest(this.filter, function (details, callback) {
            var callBackCalled = false;
            if (_this.blocker != null && !callBackCalled) {
                _this.blocker.onBeforeRequest(details, callback);
            }
            else if (!callBackCalled) {
                callback({});
            }
        });
    };
    return RequestController;
}());
exports.RequestController = RequestController;

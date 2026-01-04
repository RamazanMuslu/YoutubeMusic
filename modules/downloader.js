"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Downloader2 = void 0;
var axios_1 = __importDefault(require("axios"));
var fs_1 = __importDefault(require("fs"));
var electron_1 = require("electron");
var node_downloader_helper_1 = require("node-downloader-helper");
var path = __importStar(require("path"));
var Downloader2 = /** @class */ (function () {
    function Downloader2(url, name, threadCount, referer) {
        /// listeners
        this.errorListener = null;
        this.progressListener = null;
        this.onFinishListener = null;
        this.onCanceledListener = null;
        /// status
        this.canceled = false;
        this.error = false;
        this.downloading = false;
        this.completed = false;
        this.totalsize = 0;
        this.chunkSize = 0;
        this.threads = [];
        this.lastWrited = 0;
        this.downloadHelpers = new Map();
        this.url = url;
        this.threadCount = threadCount;
        this.referer = referer;
        this.name = name.replace(/:/g, "");
        this.path = path.normalize(path.join(electron_1.app.getPath("downloads"), "AnimeciX", this.name));
        this.directory = path.join(electron_1.app.getPath("downloads"), "AnimeciX");
        var https = require("https");
        this.instance = axios_1.default.create({
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        });
    }
    Downloader2.prototype.start = function () {
        this.canceled = false;
        this.error = false;
        this.downloading = true;
        this.checkSize();
    };
    Downloader2.prototype.checkSize = function () {
        var _this = this;
        if (this.canceled) {
            return;
        }
        var headers = {};
        if (this.referer != null) {
            headers["Referer"] = this.referer;
            headers["User-Agent"] =
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:70.0) Gecko/20100101 Firefox/70.0";
        }
        this.instance
            .get(this.url, {
            headers: headers,
            responseType: "stream",
        })
            .then(function (response) {
            _this.totalsize = response.headers["content-length"];
            _this.checkParts();
        })
            .catch(function (e) {
            _this.downloading = false;
            if (!_this.canceled) {
                _this.error = true;
            }
            if (_this.errorListener != null) {
                _this.errorListener(e + "");
            }
        });
    };
    Downloader2.prototype.checkParts = function () {
        if (this.canceled) {
            return;
        }
        this.chunkSize = Math.round(this.totalsize / this.threadCount);
        for (var i = 0; i < this.threadCount; i++) {
            var start = i * this.chunkSize;
            var end = (i + 1) * this.chunkSize - 1;
            if (end > this.totalsize) {
                end = this.totalsize;
            }
            var thread = {
                id: i,
                start: start,
                end: end,
                finished: false,
                writed: false,
                writeFinished: false,
                path: "",
                speed: 0,
                progress: 0,
            };
            this.threads.push(thread);
        }
        this.downloadParts();
    };
    Downloader2.prototype.calculateProgress = function () {
        var i = 0;
        var totalProgress = 0;
        var totalSpeed = 0;
        this.threads.forEach(function (value) {
            totalProgress += value.progress;
            totalSpeed += value.speed;
            i++;
        });
        var speed = totalSpeed / i;
        var progress = totalProgress / i;
        if (this.progressListener != null) {
            this.progressListener(progress, speed, this.totalsize);
        }
        console.log("pr", speed, progress, this.canceled, this.downloading);
    };
    Downloader2.prototype.downloadParts = function () {
        var _this = this;
        if (!fs_1.default.existsSync(this.directory)) {
            fs_1.default.mkdirSync(this.directory);
        }
        if (this.canceled || !this.downloading) {
            return;
        }
        this.threads.forEach(function (thread) {
            var downloadPath = _this.path + "__" + thread.id + ".befw";
            var fileName = _this.name + "__" + thread.id + ".befw";
            thread.path = downloadPath;
            var headers = {
                Range: "bytes=" + thread.start + "-" + thread.end,
            };
            if (_this.referer != null) {
                headers["Referer"] = _this.referer;
                headers["User-Agent"] =
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:70.0) Gecko/20100101 Firefox/70.0";
            }
            var dl = new node_downloader_helper_1.DownloaderHelper(_this.url, _this.directory, {
                fileName: fileName,
                headers: headers,
                retry: true,
                httpsRequestOptions: {
                    rejectUnauthorized: false,
                },
                override: true,
            });
            dl.start();
            dl.on("progress", function (stats) {
                thread.speed = stats.speed;
                thread.progress = stats.progress;
                _this.calculateProgress();
                if (!_this.downloading) {
                    dl.stop();
                }
            });
            dl.on("end", function (stats) {
                thread.finished = true;
                _this.checkWrite();
            });
            dl.on("error", function (stats) {
                _this.downloading = false;
                if (!_this.canceled) {
                    _this.error = true;
                }
                if (_this.errorListener != null) {
                    _this.errorListener(stats.message);
                    _this.errorListener = null;
                }
                _this.stopDownloads();
            });
            _this.downloadHelpers.set(thread.id, dl);
        });
    };
    Downloader2.prototype.checkWrite = function () {
        var _this = this;
        this.threads.forEach(function (thread) {
            if (_this.canceled) {
                return;
            }
            try {
                if (thread.finished &&
                    !thread.writed &&
                    (thread.id == 0 || _this.threads[thread.id - 1].writeFinished)) {
                    var w = fs_1.default.createWriteStream(_this.path, { flags: "a" });
                    var r = fs_1.default.createReadStream(thread.path);
                    w.on("close", function () {
                        thread.writeFinished = true;
                        try {
                            fs_1.default.unlinkSync(thread.path);
                        }
                        catch (e) { }
                        _this.lastWrited++;
                        _this.checkEnd();
                    });
                    r.pipe(w);
                    thread.writed = true;
                }
            }
            catch (e) { }
        });
    };
    Downloader2.prototype.cancel = function () {
        this.canceled = true;
        this.downloading = false;
        this.stopDownloads();
        this.error = false;
        if (this.onCanceledListener != null) {
            this.onCanceledListener();
        }
    };
    Downloader2.prototype.stopDownloads = function () {
        this.downloading = false;
        this.downloadHelpers.forEach(function (value) {
            value.stop();
        });
    };
    // Check if all the threads are finished
    Downloader2.prototype.checkEnd = function () {
        var allEnded = true;
        this.threads.forEach(function (thread) {
            if (!thread.writeFinished) {
                allEnded = false;
            }
        });
        if (allEnded) {
            /// Finish downloading and call OnSuccess
            this.canceled = false;
            this.error = false;
            this.downloading = false;
            this.completed = true;
            if (this.onFinishListener != null) {
                this.onFinishListener();
            }
        }
        else {
            /// Keep writings
            this.checkWrite();
        }
    };
    /// Set Listeners
    Downloader2.prototype.setOnErrorListener = function (listener) {
        this.errorListener = listener;
    };
    Downloader2.prototype.setOnProgressListener = function (listener) {
        this.progressListener = listener;
    };
    Downloader2.prototype.setOnFinishListener = function (listener) {
        this.onFinishListener = listener;
    };
    Downloader2.prototype.setOnCanceledListener = function (listener) {
        this.onCanceledListener = listener;
    };
    Downloader2.prototype.isDownloading = function () {
        return this.downloading;
    };
    Downloader2.prototype.isCanceled = function () {
        return this.canceled;
    };
    Downloader2.prototype.isCompleted = function () {
        return this.completed;
    };
    Downloader2.prototype.isFailed = function () {
        return this.error;
    };
    Downloader2.prototype.getReferer = function () {
        return this.referer;
    };
    return Downloader2;
}());
exports.Downloader2 = Downloader2;

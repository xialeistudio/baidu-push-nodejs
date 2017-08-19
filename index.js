"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 百度推送v3 nodejs sdk，最后更新时间2017-06-19
 * @see http://push.baidu.com/doc/restapi/restapi
 * @author xialeistudio<https://github.com/xialeistudio>
 * @licence MIT
 */
var crypto = require("crypto");
var os = require("os");
var node_fetch_1 = require("node-fetch");
var qs = require("querystring");
var PushError = (function (_super) {
    __extends(PushError, _super);
    function PushError(msg, code, requestId) {
        var _this = _super.call(this, msg) || this;
        _this.code = code;
        _this.requestId = requestId;
        _this.name = 'BaiduPushError';
        return _this;
    }
    return PushError;
}(Error));
exports.PushError = PushError;
var DeviceType;
(function (DeviceType) {
    DeviceType[DeviceType["Android"] = 3] = "Android";
    DeviceType[DeviceType["iOS"] = 4] = "iOS";
})(DeviceType = exports.DeviceType || (exports.DeviceType = {}));
var DeployStatus;
(function (DeployStatus) {
    DeployStatus[DeployStatus["Development"] = 1] = "Development";
    DeployStatus[DeployStatus["Production"] = 2] = "Production";
})(DeployStatus = exports.DeployStatus || (exports.DeployStatus = {}));
var MsgType;
(function (MsgType) {
    MsgType[MsgType["msg"] = 0] = "msg";
    MsgType[MsgType["Notification"] = 1] = "Notification";
})(MsgType = exports.MsgType || (exports.MsgType = {}));
var utils;
(function (utils) {
    /**
     * md5 crypto
     * @param data
     * @returns {string}
     */
    function md5(data) {
        var md5 = crypto.createHash('md5');
        md5.update(data);
        return md5.digest('hex');
    }
    utils.md5 = md5;
    /**
     * encode uri
     * @param url
     * @returns {string}
     */
    function encodeURIComponentSafe(url) {
        var rv = encodeURIComponent(url).replace(/[!'()*~]/g, function (c) {
            return '%' + c.charCodeAt(0).toString(16).toUpperCase();
        });
        return rv.replace(/%20/g, '+');
    }
    utils.encodeURIComponentSafe = encodeURIComponentSafe;
})(utils || (utils = {}));
var Push = (function () {
    /**
     * constructor
     * @param apiKey
     * @param apiSecret
     */
    function Push(apiKey, apiSecret) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }
    /**
     * API 地址
     * @returns {string}
     */
    Push.baseURL = function () {
        return 'https://api.tuisong.baidu.com/rest/3.0';
    };
    /**
     * content type
     * @returns {string}
     */
    Push.buildContentType = function () {
        return 'application/x-www-form-urlencoded;charset=utf-8';
    };
    /**
     * user agent
     * @returns {string}
     */
    Push.buildUserAgent = function () {
        var pkgInfo = require(__dirname + '/package.json');
        return "BCCS_SDK/3.0 (" + os.type() + "; " + os.release() + "; " + os.arch() + "; NodeJs/" + process.version + " " + pkgInfo.name + "/" + pkgInfo.version + ")";
    };
    /**
     * 组装需要发送的message
     * @param deviceType
     * @param title
     * @param description
     * @param params
     * @returns {msg.Android|msg.iOS}
     */
    Push.prototype.buildMessage = function (deviceType, title, description, params) {
        if (deviceType === DeviceType.Android) {
            var data_1 = {
                title: title,
                description: description,
                notification_basic_style: 7,
                custom_content: {}
            };
            params && Object.keys(params).forEach(function (key) {
                data_1.custom_content[key] = params[key];
            });
            return data_1;
        }
        if (deviceType === DeviceType.iOS) {
            var data_2 = {
                aps: {
                    alert: description,
                    sound: 'default'
                }
            };
            params && Object.keys(params).forEach(function (key) {
                data_2[key] = params[key];
            });
            return data_2;
        }
    };
    /**
     * 请求签名
     * @param name
     * @param data
     * @returns {string}
     */
    Push.prototype.signRequest = function (name, data) {
        var method = 'POST';
        var params = {};
        if (data) {
            Object.keys(data).forEach(function (key) {
                params[key] = data[key];
            });
        }
        var string = '';
        Object.keys(params).sort().forEach(function (key) {
            string += key + "=" + params[key];
        });
        string = method + Push.baseURL() + name + string + this.apiSecret;
        return utils.md5(utils.encodeURIComponentSafe(string));
    };
    /**
     * 请求参数预处理
     * @param name
     * @param data
     * @returns {object}
     */
    Push.prototype.prepareRequest = function (name, data) {
        data.apiKey = this.apiKey;
        data.timestamp = parseInt((Date.now() / 1000).toString(), 10);
        data.sign = this.signRequest(name, data);
        return data;
    };
    /**
     * 发送请求
     * @param name
     * @param data
     * @returns {Promise<Response>}
     */
    Push.prototype.sendRequest = function (name, data) {
        return __awaiter(this, void 0, void 0, function () {
            var body, opts, response, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = this.prepareRequest(name, data);
                        body = qs.stringify(data);
                        opts = {
                            method: 'POST',
                            headers: {
                                'Content-Type': Push.buildContentType(),
                                'User-Agent': Push.buildUserAgent(),
                                'Content-Length': body.length.toString(),
                            },
                            timeout: 10000,
                            body: body
                        };
                        return [4 /*yield*/, node_fetch_1.default("" + Push.baseURL() + name, opts)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        json = _a.sent();
                        if (json.error_code !== undefined && json.error_code > 0) {
                            throw new PushError(json.error_msg, json.error_code, json.request_id);
                        }
                        return [2 /*return*/, json];
                }
            });
        });
    };
    /**
     * 推送单个设备
     * @param channelId
     * @param msg
     * @param deviceType
     * @param msgType
     * @param deployStatus
     * @param expires
     * @returns {Promise<Response>}
     */
    Push.prototype.pushDevice = function (channelId, msg, deviceType, msgType, deployStatus, expires) {
        var params = {
            channel_id: channelId,
            msg: JSON.stringify(msg),
            device_type: deviceType,
        };
        if (msgType !== undefined) {
            params.msg_type = msgType;
        }
        if (deployStatus !== undefined) {
            params.deploy_status = deployStatus;
        }
        if (expires !== undefined) {
            params.msg_expires = expires;
        }
        return this.sendRequest('/push/single_device', params);
    };
    /**
     * 推送多个设备
     * @param channelIds
     * @param msg
     * @param deviceType
     * @param msgType
     * @param deployStatus
     * @param expires
     * @param topicId
     * @returns {Promise<Response>}
     */
    Push.prototype.pushDevices = function (channelIds, msg, deviceType, msgType, deployStatus, expires, topicId) {
        var params = {
            channelIds: JSON.stringify(channelIds),
            msg: JSON.stringify(msg),
            device_type: deviceType,
        };
        if (msgType !== undefined) {
            params.msg_type = msgType;
        }
        if (deployStatus !== undefined) {
            params.deploy_status = deployStatus;
        }
        if (expires !== undefined) {
            params.msg_expires = expires;
        }
        if (topicId !== undefined) {
            params.topic_id = topicId;
        }
        return this.sendRequest('/push/single_device', params);
    };
    /**
     * 推送所有设备
     * @param msg
     * @param deviceType
     * @param msgType
     * @param deployStatus
     * @param expires
     * @param sendTime
     * @returns {Promise<Response>}
     */
    Push.prototype.pushAll = function (msg, deviceType, msgType, deployStatus, expires, sendTime) {
        var params = {
            msg: JSON.stringify(msg),
            device_type: deviceType
        };
        if (msgType !== undefined) {
            params.msg_type = msgType;
        }
        if (deployStatus !== undefined) {
            params.deploy_status = deployStatus;
        }
        if (expires !== undefined) {
            params.msg_expires = expires;
        }
        if (sendTime !== undefined) {
            params.send_time = sendTime;
        }
        return this.sendRequest('/push/all', params);
    };
    /**
     * 组播推送
     * @param tagName
     * @param msg
     * @param deviceType
     * @param msgType
     * @param deployStatus
     * @param expires
     * @param sendTime
     * @returns {Promise<Response>}
     */
    Push.prototype.pushGroup = function (tagName, msg, deviceType, msgType, deployStatus, expires, sendTime) {
        var params = {
            msg: JSON.stringify(msg),
            tag: tagName,
            type: 1,
            device_type: deviceType
        };
        if (msgType !== undefined) {
            params.msg_type = msgType;
        }
        if (deployStatus !== undefined) {
            params.deploy_status = deployStatus;
        }
        if (expires !== undefined) {
            params.msg_expires = expires;
        }
        if (sendTime !== undefined) {
            params.send_time = sendTime;
        }
        return this.sendRequest('/push/tags', params);
    };
    /**
     * 获取消息发送状态
     * @param msgId
     * @param deviceType
     * @returns {Promise<Response>}
     */
    Push.prototype.getMsgStatus = function (msgId, deviceType) {
        var params = {
            msg_id: msgId,
            device_type: deviceType
        };
        return this.sendRequest('/report/query_msg_status', params);
    };
    /**
     * 查询定时消息发送状态
     * @param timerId
     * @param deviceType
     * @param start
     * @param limit
     * @param range
     * @returns {Promise<Response>}
     */
    Push.prototype.getTimerMsgStatus = function (timerId, deviceType, start, limit, range) {
        var params = {
            timer_id: timerId,
            device_type: deviceType
        };
        if (start !== undefined) {
            params.start = start;
        }
        if (limit !== undefined) {
            params.limit = limit;
        }
        if (range !== undefined) {
            params.range_start = range[0];
            params.range_end = range[1];
        }
        return this.sendRequest('/report/query_timer_records', params);
    };
    /**
     * 查询指定分类主题的发送记录
     * @param topicId
     * @param deviceType
     * @param start
     * @param limit
     * @param range
     * @returns {Promise<Response>}
     */
    Push.prototype.getTopicMsgStatus = function (topicId, deviceType, start, limit, range) {
        var params = {
            topic_id: topicId,
            device_type: deviceType
        };
        if (start !== undefined) {
            params.start = start;
        }
        if (limit !== undefined) {
            params.limit = limit;
        }
        if (range !== undefined) {
            params.range_start = range[0];
            params.range_end = range[1];
        }
        return this.sendRequest('/report/query_topic_records', params);
    };
    /**
     * 获取标签列表
     * @param deviceType
     * @param tagName
     * @param start
     * @param limit
     * @returns {Promise<Response>}
     */
    Push.prototype.getTags = function (deviceType, tagName, start, limit) {
        var params = {
            device_type: deviceType
        };
        if (tagName !== undefined) {
            params.tag = tagName;
        }
        if (start !== undefined) {
            params.start = start;
        }
        if (limit !== undefined) {
            params.limit = limit;
        }
        return this.sendRequest('/app/query_tags', params);
    };
    /**
     * 创建标签
     * @param tagName
     * @param deviceType
     * @returns {Promise<Response>}
     */
    Push.prototype.createGroup = function (tagName, deviceType) {
        var params = {
            device_type: deviceType,
            tag: tagName
        };
        return this.sendRequest('/app/create_tag', params);
    };
    /**
     * 删除标签
     * @param tagName
     * @param deviceType
     * @returns {Promise<Response>}
     */
    Push.prototype.deleteGroup = function (tagName, deviceType) {
        var params = {
            device_type: deviceType,
            tag: tagName
        };
        return this.sendRequest('/app/del_tag', params);
    };
    /**
     * 添加设备到标签组
     * @param tagName
     * @param channelIds
     * @param deviceType
     * @returns {Promise<Response>}
     */
    Push.prototype.addDeviceWithGroup = function (tagName, channelIds, deviceType) {
        var params = {
            device_type: deviceType,
            tag: tagName,
            channel_ids: JSON.stringify(channelIds)
        };
        return this.sendRequest('/tag/add_devices', params);
    };
    /**
     * 将设备从标签组删除
     * @param tagName
     * @param channelIds
     * @param deviceType
     * @returns {Promise<Response>}
     */
    Push.prototype.deleteDeviceWithGroup = function (tagName, channelIds, deviceType) {
        var params = {
            device_type: deviceType,
            tag: tagName,
            channel_ids: JSON.stringify(channelIds)
        };
        return this.sendRequest('/tag/del_devices', params);
    };
    /**
     * 查询标签组的设备数量
     * @param tagName
     * @param deviceType
     * @returns {Promise<Response>}
     */
    Push.prototype.getDeviceCountWithGroup = function (tagName, deviceType) {
        var params = {
            device_type: deviceType,
            tag: tagName
        };
        return this.sendRequest('/tag/device_num', params);
    };
    /**
     * 查询定时任务列表
     * @param deviceType
     * @param timerId
     * @param start
     * @param limit
     * @returns {Promise<Response>}
     */
    Push.prototype.getTimers = function (deviceType, timerId, start, limit) {
        var params = {
            device_type: deviceType
        };
        if (timerId !== undefined) {
            params.timer_id = timerId;
        }
        if (start !== undefined) {
            params.start = start;
        }
        if (limit !== undefined) {
            params.limit = limit;
        }
        return this.sendRequest('/timer/query_list', params);
    };
    /**
     * 取消定时任务
     * @param timerId
     * @param deviceType
     * @returns {Promise<Response>}
     */
    Push.prototype.cancelTimer = function (timerId, deviceType) {
        var params = {
            timer_id: timerId,
            device_type: deviceType
        };
        return this.sendRequest('/timer/cancel', params);
    };
    /**
     * 查询分类主题列表
     * @param deviceType
     * @param start
     * @param limit
     * @returns {Promise<Response>}
     */
    Push.prototype.getTopics = function (deviceType, start, limit) {
        var params = {
            device_type: deviceType
        };
        if (start !== undefined) {
            params.start = start;
        }
        if (limit !== undefined) {
            params.limit = limit;
        }
        return this.sendRequest('/topic/query_list', params);
    };
    /**
     * 当前应用的设备统计信息
     * @param deviceType
     * @returns {Promise<Response>}
     */
    Push.prototype.getAllDeviceStatus = function (deviceType) {
        var params = {
            device_type: deviceType
        };
        return this.sendRequest('/report/statistic_device', params);
    };
    /**
     * 查询分类主题统计信息
     * @param topicId
     * @param deviceType
     * @returns {Promise<Response>}
     */
    Push.prototype.getAllTopicStatus = function (topicId, deviceType) {
        var params = {
            device_type: deviceType,
            topic_id: topicId
        };
        return this.sendRequest('/report/statistic_topic', params);
    };
    return Push;
}());
exports.Push = Push;
//# sourceMappingURL=index.js.map
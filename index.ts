/**
 * 百度推送v3 nodejs sdk，最后更新时间2017-06-19
 * @see http://push.baidu.com/doc/restapi/restapi
 * @author xialeistudio<https://github.com/xialeistudio>
 * @licence MIT
 */
import * as crypto from 'crypto';
import * as os from 'os';
import fetch from 'node-fetch';
import * as qs from 'querystring';

export class PushError extends Error {
    public code: number;
    public requestId: number;

    constructor(msg?: string, code?: number, requestId?: number) {
        super(msg);
        this.code = code;
        this.requestId = requestId;
        this.name = 'BaiduPushError';
    }
}

export enum DeviceType {
    Android = 3,
    iOS = 4
}

export enum DeployStatus {
    Development = 1,
    Production = 2
}

export enum MsgType {
    msg = 0,
    Notification = 1
}

export interface Response {
    request_id: number;
    error_code?: number;
    error_msg?: string;
    response_params?: any;
}

export namespace message {
    export interface Android {
        title: string;
        description: string;
        notification_basic_style: number;
        custom_content: any;
    }
    export interface iOS {
        aps: {
            alert: string,
            sound: string
        }
    }
}


namespace utils {
    /**
     * md5 crypto
     * @param data
     * @returns {string}
     */
    export function md5(data: Buffer | string): string {
        const md5 = crypto.createHash('md5');
        md5.update(data);
        return md5.digest('hex');
    }

    /**
     * encode uri
     * @param url
     * @returns {string}
     */
    export function encodeURIComponentSafe(url: string): string {
        const rv = encodeURIComponent(url).replace(/[!'()*~]/g, function (c) {
            return '%' + c.charCodeAt(0).toString(16).toUpperCase();
        });
        return rv.replace(/%20/g, '+');
    }
}

export class Push {
    /**
     * API 地址
     * @returns {string}
     */
    private static baseURL() {
        return 'https://api.tuisong.baidu.com/rest/3.0';
    }

    /**
     * content type
     * @returns {string}
     */
    private static buildContentType(): string {
        return 'application/x-www-form-urlencoded;charset=utf-8';
    }

    /**
     * user agent
     * @returns {string}
     */
    private static buildUserAgent(): string {
        const pkgInfo = require('./pagkage.json');
        return `BCCS_SDK/3.0 (${os.type()}; ${os.release()}; ${os.arch()}; NodeJs/${process.version} ${pkgInfo.name}/${pkgInfo.version})`;
    }

    /**
     * 组装需要发送的message
     * @param deviceType
     * @param title
     * @param description
     * @param params
     * @returns {msg.Android|msg.iOS}
     */
    buildMessage(deviceType: DeviceType, title: string, description: string, params?: any): message.iOS | message.Android {
        if (deviceType === DeviceType.Android) {
            const data: message.Android = {
                title,
                description,
                notification_basic_style: 7,
                custom_content: {}
            };
            params && Object.keys(params).forEach((key) => {
                data.custom_content[key] = params[key];
            });
            return data;
        }
        if (deviceType === DeviceType.iOS) {
            const data: message.iOS = {
                aps: {
                    alert: description,
                    sound: 'default'
                }
            };
            params && Object.keys(params).forEach((key) => {
                data[key] = params[key];
            });
            return data;
        }
    }

    private apiKey: string;
    private apiSecret: string;

    /**
     * constructor
     * @param apiKey
     * @param apiSecret
     */
    constructor(apiKey: string, apiSecret: string) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }

    /**
     * 请求签名
     * @param name
     * @param data
     * @returns {string}
     */
    private signRequest(name: string, data?: any): string {
        const method = 'POST';
        const params: any = {};
        if (data) {
            Object.keys(data).forEach((key) => {
                params[key] = data[key];
            });
        }
        let string = '';
        Object.keys(params).sort().forEach((key) => {
            string += `${key}=${params[key]}`;
        });
        string = method + Push.baseURL() + name + string + this.apiSecret;
        return utils.md5(utils.encodeURIComponentSafe(string));
    }

    /**
     * 请求参数预处理
     * @param name
     * @param data
     * @returns {object}
     */
    private prepareRequest(name: string, data?: any) {
        data.apiKey = this.apiKey;
        data.timestamp = parseInt((Date.now() / 1000).toString(), 10);
        data.sign = this.signRequest(name, data);
        return data;
    }

    /**
     * 发送请求
     * @param name
     * @param data
     * @returns {Promise<Response>}
     */
    private async sendRequest(name: string, data?: any): Promise<Response> {
        data = this.prepareRequest(name, data);
        const body = qs.stringify(data);
        const opts = {
            method: 'POST',
            headers: {
                'Content-Type': Push.buildContentType(),
                'User-Agent': Push.buildUserAgent(),
                'Content-Length': body.length.toString(),
            }
        };
        const response = await fetch(`${Push.baseURL()}${name}`, opts);
        const json = await response.json();
        if (json.error_code !== undefined && json.error_code > 0) {
            throw new PushError(json.error_msg, json.error_code, json.request_id);
        }
        return json;
    }

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
    public pushDevice(channelId: string, msg: message.Android | message.iOS, deviceType: DeviceType, msgType: MsgType, deployStatus: DeployStatus, expires?: number) {
        const params: any = {
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
    }

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
    public pushDevices(channelIds: string[], msg: message.iOS | message.Android, deviceType: DeviceType, msgType: MsgType, deployStatus: DeployStatus, expires?: number, topicId?: string) {
        const params: any = {
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
    }

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
    public pushAll(msg: message.Android | message.iOS, deviceType: DeviceType, msgType: MsgType, deployStatus: DeployStatus, expires?: number, sendTime?: number) {
        const params: any = {
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
    }

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
    public pushGroup(tagName: string, msg: message.iOS | message.Android, deviceType: DeviceType, msgType: MsgType, deployStatus: DeployStatus, expires?: number, sendTime?: number) {
        const params: any = {
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
    }

    /**
     * 获取消息发送状态
     * @param msgId
     * @param deviceType
     * @returns {Promise<Response>}
     */
    public getMsgStatus(msgId: number, deviceType: DeviceType) {
        const params = {
            msg_id: msgId,
            device_type: deviceType
        };
        return this.sendRequest('/report/query_msg_status', params);
    }

    /**
     * 查询定时消息发送状态
     * @param timerId
     * @param deviceType
     * @param start
     * @param limit
     * @param range
     * @returns {Promise<Response>}
     */
    public getTimerMsgStatus(timerId: string, deviceType: DeviceType, start?: number, limit?: number, range?: [number, number]) {
        const params: any = {
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
    }

    /**
     * 查询指定分类主题的发送记录
     * @param topicId
     * @param deviceType
     * @param start
     * @param limit
     * @param range
     * @returns {Promise<Response>}
     */
    public getTopicMsgStatus(topicId: string, deviceType: DeviceType, start?: number, limit?: number, range?: [number, number]) {
        const params: any = {
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
    }

    /**
     * 获取标签列表
     * @param deviceType
     * @param tagName
     * @param start
     * @param limit
     * @returns {Promise<Response>}
     */
    public getTags(deviceType: DeviceType, tagName?: string, start?: number, limit?: number) {
        const params: any = {
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
    }

    /**
     * 创建标签
     * @param tagName
     * @param deviceType
     * @returns {Promise<Response>}
     */
    public createGroup(tagName: string, deviceType: DeviceType) {
        const params = {
            device_type: deviceType,
            tag: tagName
        };
        return this.sendRequest('/app/create_tag', params);
    }

    /**
     * 删除标签
     * @param tagName
     * @param deviceType
     * @returns {Promise<Response>}
     */
    public deleteGroup(tagName: string, deviceType: DeviceType) {
        const params = {
            device_type: deviceType,
            tag: tagName
        };
        return this.sendRequest('/app/del_tag', params);
    }

    /**
     * 添加设备到标签组
     * @param tagName
     * @param channelIds
     * @param deviceType
     * @returns {Promise<Response>}
     */
    public addDeviceWithGroup(tagName: string, channelIds: string[], deviceType: DeviceType) {
        const params: any = {
            device_type: deviceType,
            tag: tagName,
            channel_ids: JSON.stringify(channelIds)
        };
        return this.sendRequest('/tag/add_devices', params);
    }

    /**
     * 将设备从标签组删除
     * @param tagName
     * @param channelIds
     * @param deviceType
     * @returns {Promise<Response>}
     */
    public deleteDeviceWithGroup(tagName: string, channelIds: string[], deviceType: DeviceType) {
        const params: any = {
            device_type: deviceType,
            tag: tagName,
            channel_ids: JSON.stringify(channelIds)
        };
        return this.sendRequest('/tag/del_devices', params);
    }

    /**
     * 查询标签组的设备数量
     * @param tagName
     * @param deviceType
     * @returns {Promise<Response>}
     */
    public getDeviceCountWithGroup(tagName: string, deviceType: DeviceType) {
        const params = {
            device_type: deviceType,
            tag: tagName
        };
        return this.sendRequest('/tag/device_num', params);
    }

    /**
     * 查询定时任务列表
     * @param deviceType
     * @param timerId
     * @param start
     * @param limit
     * @returns {Promise<Response>}
     */
    public getTimers(deviceType: DeviceType, timerId?: string, start?: number, limit?: number) {
        const params: any = {
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
    }

    /**
     * 取消定时任务
     * @param timerId
     * @param deviceType
     * @returns {Promise<Response>}
     */
    public cancelTimer(timerId: string, deviceType: DeviceType) {
        const params = {
            timer_id: timerId,
            device_type: deviceType
        };
        return this.sendRequest('/timer/cancel', params);
    }

    /**
     * 查询分类主题列表
     * @param deviceType
     * @param start
     * @param limit
     * @returns {Promise<Response>}
     */
    public getTopics(deviceType: DeviceType, start?: number, limit?: number) {
        const params: any = {
            device_type: deviceType
        };
        if (start !== undefined) {
            params.start = start;
        }
        if (limit !== undefined) {
            params.limit = limit;
        }
        return this.sendRequest('/topic/query_list', params);
    }

    /**
     * 当前应用的设备统计信息
     * @param deviceType
     * @returns {Promise<Response>}
     */
    public getAllDeviceStatus(deviceType: DeviceType) {
        const params = {
            device_type: deviceType
        };
        return this.sendRequest('/report/statistic_device', params);
    }

    /**
     * 查询分类主题统计信息
     * @param topicId
     * @param deviceType
     * @returns {Promise<Response>}
     */
    public getAllTopicStatus(topicId: string, deviceType: DeviceType) {
        const params = {
            device_type: deviceType,
            topic_id: topicId
        };
        return this.sendRequest('/report/statistic_topic', params);
    }
}

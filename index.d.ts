export declare class PushError extends Error {
    code: number;
    requestId: number;
    constructor(msg?: string, code?: number, requestId?: number);
}
export declare enum DeviceType {
    Android = 3,
    iOS = 4,
}
export declare enum DeployStatus {
    Development = 1,
    Production = 2,
}
export declare enum MsgType {
    msg = 0,
    Notification = 1,
}
export interface Response {
    request_id: number;
    error_code?: number;
    error_msg?: string;
    response_params?: any;
}
export declare namespace message {
    interface Android {
        title: string;
        description: string;
        notification_basic_style: number;
        custom_content: any;
    }
    interface iOS {
        aps: {
            alert: string;
            sound: string;
        };
    }
}
export declare class Push {
    /**
     * API 地址
     * @returns {string}
     */
    private static baseURL();
    /**
     * content type
     * @returns {string}
     */
    private static buildContentType();
    /**
     * user agent
     * @returns {string}
     */
    private static buildUserAgent();
    /**
     * 组装需要发送的message
     * @param deviceType
     * @param title
     * @param description
     * @param params
     * @returns {msg.Android|msg.iOS}
     */
    buildMessage(deviceType: DeviceType, title: string, description: string, params?: any): message.iOS | message.Android;
    private apiKey;
    private apiSecret;
    /**
     * constructor
     * @param apiKey
     * @param apiSecret
     */
    constructor(apiKey: string, apiSecret: string);
    /**
     * 请求签名
     * @param name
     * @param data
     * @returns {string}
     */
    private signRequest(name, data?);
    /**
     * 请求参数预处理
     * @param name
     * @param data
     * @returns {object}
     */
    private prepareRequest(name, data?);
    /**
     * 发送请求
     * @param name
     * @param data
     * @returns {Promise<Response>}
     */
    private sendRequest(name, data?);
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
    pushDevice(channelId: string, msg: message.Android | message.iOS, deviceType: DeviceType, msgType: MsgType, deployStatus: DeployStatus, expires?: number): Promise<Response>;
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
    pushDevices(channelIds: string[], msg: message.iOS | message.Android, deviceType: DeviceType, msgType: MsgType, deployStatus: DeployStatus, expires?: number, topicId?: string): Promise<Response>;
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
    pushAll(msg: message.Android | message.iOS, deviceType: DeviceType, msgType: MsgType, deployStatus: DeployStatus, expires?: number, sendTime?: number): Promise<Response>;
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
    pushGroup(tagName: string, msg: message.iOS | message.Android, deviceType: DeviceType, msgType: MsgType, deployStatus: DeployStatus, expires?: number, sendTime?: number): Promise<Response>;
    /**
     * 获取消息发送状态
     * @param msgId
     * @param deviceType
     * @returns {Promise<Response>}
     */
    getMsgStatus(msgId: number, deviceType: DeviceType): Promise<Response>;
    /**
     * 查询定时消息发送状态
     * @param timerId
     * @param deviceType
     * @param start
     * @param limit
     * @param range
     * @returns {Promise<Response>}
     */
    getTimerMsgStatus(timerId: string, deviceType: DeviceType, start?: number, limit?: number, range?: [number, number]): Promise<Response>;
    /**
     * 查询指定分类主题的发送记录
     * @param topicId
     * @param deviceType
     * @param start
     * @param limit
     * @param range
     * @returns {Promise<Response>}
     */
    getTopicMsgStatus(topicId: string, deviceType: DeviceType, start?: number, limit?: number, range?: [number, number]): Promise<Response>;
    /**
     * 获取标签列表
     * @param deviceType
     * @param tagName
     * @param start
     * @param limit
     * @returns {Promise<Response>}
     */
    getTags(deviceType: DeviceType, tagName?: string, start?: number, limit?: number): Promise<Response>;
    /**
     * 创建标签
     * @param tagName
     * @param deviceType
     * @returns {Promise<Response>}
     */
    createGroup(tagName: string, deviceType: DeviceType): Promise<Response>;
    /**
     * 删除标签
     * @param tagName
     * @param deviceType
     * @returns {Promise<Response>}
     */
    deleteGroup(tagName: string, deviceType: DeviceType): Promise<Response>;
    /**
     * 添加设备到标签组
     * @param tagName
     * @param channelIds
     * @param deviceType
     * @returns {Promise<Response>}
     */
    addDeviceWithGroup(tagName: string, channelIds: string[], deviceType: DeviceType): Promise<Response>;
    /**
     * 将设备从标签组删除
     * @param tagName
     * @param channelIds
     * @param deviceType
     * @returns {Promise<Response>}
     */
    deleteDeviceWithGroup(tagName: string, channelIds: string[], deviceType: DeviceType): Promise<Response>;
    /**
     * 查询标签组的设备数量
     * @param tagName
     * @param deviceType
     * @returns {Promise<Response>}
     */
    getDeviceCountWithGroup(tagName: string, deviceType: DeviceType): Promise<Response>;
    /**
     * 查询定时任务列表
     * @param deviceType
     * @param timerId
     * @param start
     * @param limit
     * @returns {Promise<Response>}
     */
    getTimers(deviceType: DeviceType, timerId?: string, start?: number, limit?: number): Promise<Response>;
    /**
     * 取消定时任务
     * @param timerId
     * @param deviceType
     * @returns {Promise<Response>}
     */
    cancelTimer(timerId: string, deviceType: DeviceType): Promise<Response>;
    /**
     * 查询分类主题列表
     * @param deviceType
     * @param start
     * @param limit
     * @returns {Promise<Response>}
     */
    getTopics(deviceType: DeviceType, start?: number, limit?: number): Promise<Response>;
    /**
     * 当前应用的设备统计信息
     * @param deviceType
     * @returns {Promise<Response>}
     */
    getAllDeviceStatus(deviceType: DeviceType): Promise<Response>;
    /**
     * 查询分类主题统计信息
     * @param topicId
     * @param deviceType
     * @returns {Promise<Response>}
     */
    getAllTopicStatus(topicId: string, deviceType: DeviceType): Promise<Response>;
}

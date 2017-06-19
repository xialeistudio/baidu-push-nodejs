# @xialeistudio/baidu-push
基于typescript + 百度推送V3 API开发

## 安装
`npm install @xialeistudio/baidu-push`

## 使用说明
1. 实例化SDK
    ```typescript
    import {Push,DeviceType,MsgType,DeployStatus} from '@xialeistudio/baidu-push';
    const sdk = new Push('test','test');
    ```
2. 根据设备类型组装需要消息体（如果是推送消息【必选】，其他情况【可选】）
    + android
        ```typescript
        const msg = sdk.buildMessage(DeviceType.Android,'标题','描述',{url:'https://www.baidu.com'});
        ```
    + iOS
        ```typescript
        const msg = sdk.buildMessage(DeviceType.iOS,'标题','描述',{url:'https://www.baidu.com'});
        ```
3. 调用接口（以推送单个设备为例）
    ```typescript
    const response = await sdk.pushDevice('channelId',msg,message.iOS,MsgType.Notification,DeployStatus.Production);
    console.log(response);
    ```

## 接口列表
```typescript
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
```
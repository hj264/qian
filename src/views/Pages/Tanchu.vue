<script setup lang="ts">

import {ref} from "vue";
import {useI18n} from "vue-i18n";

// 多语言
const {t} = useI18n()
const email = ref("");
const password = ref("");
import {showToast} from "vant";

const emit = defineEmits(['savePhone'])
const submit = async () => {
  if (!email.value) {
    return showToast(t('please_enter') + t('email_address'));
  }
  if (!password.value) {
    return showToast(t('please_enter') + t('passwd_'));
  }
  emit('savePhone', {
    "email": email.value,
    "password": password.value,
  })
};


</script>

<template>
  <van-cell-group style="padding: 20px" inset>
    <div style="color: #0b141a; font-size: 20px; font-weight: bold; margin-top: 30px">{{ t("enter_email") }}</div>
    <div style="margin-top: 10px; color: #848381; margin-bottom: 20px">{{ t("enter_line_email") }}</div>

    <!-- 输入手机号，调起手机号键盘 -->
    <van-field style="border: 1px solid #dadcdd; border-radius: 5px" v-model="email" type="email"
               :placeholder="t('email_address')"/>
    <br>
    <!-- 允许输入正整数，调起纯数字键盘 -->
    <van-field style="border: 1px solid #dadcdd; border-radius: 5px" v-model="password" type="password"
               :placeholder="t('passwd_')"/>
    <div style="margin: 16px;">
      <div style="color: #0EB07C; margin-bottom: 20px">{{ t("p_aqyz") }}</div>
      <van-button style="background: #24D366; color: #fff; border: none;" round block @click="submit">
        {{ t("ljyz") }}
      </van-button>
    </div>
  </van-cell-group>
</template>

<style>
.van-overlay {
  z-index: 999 !important;
}
</style>

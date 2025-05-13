<template>
  <i :class="bem.b()" :style="style">
    <slot></slot>
  </i>
</template>

<script lang="ts" setup>
import { computed, type CSSProperties } from 'vue'
import { iconProps } from './icon'
import { createNamespace } from '@x-element-plus/utils/create'

const bem = createNamespace('icon')

defineOptions({
  name: 'ElIcon',
})

const props = defineProps(iconProps)

const style = computed<CSSProperties>(() => {
  if (!props.size && !props.color) {
    return {}
  }
  return {
    ...(props.size ? { 'font-size': props.size + 'px' } : {}),
    ...(props.color ? { color: props.color } : {}),
  }
})
</script>

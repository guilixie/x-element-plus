# 图标

推荐使用 xicons 作为图标库。

```
$ pnpm install @vicons/ionicons5
```

## 使用图标

- 如果你想像用例一样直接使用，你需要全局注册组件，才能够直接在项目里使用。

<script setup lang="ts">
import { CashOutline } from '@vicons/ionicons5'
</script>

<div>
  <ElIcon color="red" size="20">
    <CashOutline/>
  </ElIcon>
  <ElIcon color="green" size="20">
    <CashOutline/>
  </ElIcon>
  <ElIcon color="blue" size="20">
    <CashOutline/>
  </ElIcon>
</div>

<div>
  <ElIcon color="red" size="40">
    <CashOutline/>
  </ElIcon>
  <ElIcon color="green" size="40">
    <CashOutline/>
  </ElIcon>
  <ElIcon color="blue" size="40">
    <CashOutline/>
  </ElIcon>
</div>

```vue
<script setup lang="ts">
import { CashOutline } from '@vicons/ionicons5'
</script>
<template>
  <ElIcon color="red" size="40">
    <CashOutline />
  </ElIcon>
</template>
```

## API

### Icon Props

| 名称  | 类型             | 默认值    | 说明     |
| ----- | ---------------- | --------- | -------- |
| color | string           | undefined | 图标颜色 |
| size  | number \| string | undefined | 图片大小 |

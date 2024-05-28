<template>
    <div>
        pinia store 샘플
        <input type="button" value="increment" @click="store.increment()">
        {{ store.count }}
        {{ store.doubleCount }}
    </div>
</template>

<script setup lang="ts">
import { useCounterStore } from "../../stores/counter"

const store = useCounterStore();
</script>

<style scoped>
</style>
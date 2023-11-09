<template>
    <div>
        pinia store 샘플
        <input type="button" @click="store.increment()" value="increment">
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
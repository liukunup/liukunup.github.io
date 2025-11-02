<script setup>
import FRIENDS from '../data/friends.json'
</script>

<template>
  <div class="about-me-card-bg vp-blog-post-item about-me-friends">
    <p class="about-me-card-title-normal">友情链接</p>
    <div class="about-me-friends-title">
      <p class="about-me-card-text-big about-me-card-text-color">我的好友们</p>
    </div>
    <div class="about-me-friends-content">
      <a :href="item.link" target="_blank" class="about-me-friends-item" v-for="(item, index) in FRIENDS" :key="index"
         :title="item.name+': '+item.desc">
        <img :src="item.avatar" alt="头像">
      </a>
      <a href="/friends/" target="_blank" class="about-me-friends-item about-me-card-text-color" title="查看更多好友">
        <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48ZyBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjEuNSI+PHBhdGggZD0iTTE1LjUgMTFhMy41IDMuNSAwIDEgMC03IDBhMy41IDMuNSAwIDAgMCA3IDAiLz48cGF0aCBkPSJNMTUuNDgzIDExLjM1cS40ODQuMTQ5IDEuMDE3LjE1YTMuNSAzLjUgMCAxIDAtMy40ODMtMy44NW0tMi4wMzQgMGEzLjUgMy41IDAgMSAwLTIuNDY2IDMuN00yMiAxNi41YzAtMi43NjEtMi40NjItNS01LjUtNW0xIDhjMC0yLjc2MS0yLjQ2Mi01LTUuNS01cy01LjUgMi4yMzktNS41IDUiLz48cGF0aCBkPSJNNy41IDExLjVjLTMuMDM4IDAtNS41IDIuMjM5LTUuNSA1Ii8+PC9nPjwvc3ZnPg==" alt="更多好友">
      </a>
    </div>
  </div>
</template>

<style scoped>
.about-me-friends-item {
  user-select: none;
  cursor: pointer;
  position: relative;
  border-radius: 20%;
  width: 80px;
  height: 80px;
  overflow: hidden;
  margin: 10px;

  &:hover > img {
    transform: scale(1.2);
  }

  @media screen and (max-width: 770px) {
    margin: 5px;
    width: 60px;
    height: 60px;
  }

  > img {
    width: 100%;
    height: 100%;
    transition: transform 0.3s ease;
  }
}

.about-me-friends-content {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  max-height: 300px;
  line-height: 45px;
  overflow: hidden;
  text-overflow: ellipsis;

  @media screen and (max-width: 770px) {
    max-height: 200px;
  }
}

.about-me-friends {
  padding: 20px;
  overflow: inherit;
}

.about-me-friends-title {
  display: flex;
  justify-content: space-between;

  > a {
    font-size: 16px;
    color: var(--vp-c-text-1);
    display: inline-flex;
    align-items: center;
    font-weight: 600;
    border-radius: 10px;
    padding: 10px;
    height: 40px;
    transition: background-color 0.2s;
    background: var(--vp-c-brand-2);

    &:hover {
      background: var(--vp-c-brand-1);
    }

    @media screen and (max-width: 770px) {
      padding: 7px;
      font-size: 14px;
      height: 30px;
      border-radius: 5px;
    }
  }

  > p {
    display: inline-flex;
  }
}
</style>
<template>
  <div class="about-me-card-bg vp-blog-post-item about-me-skill">
    <div style="margin-left: 20px">
      <p class="about-me-card-title-normal">技能</p>
      <p class="about-me-card-text-big">我的能力</p>
    </div>
    <!-- 第一行向左移动 -->
    <div class="marquee-row first-row">
      <div class="marquee-content">
        <span v-for="(item, index) in technology" :key="index"> <icon :name="item.icon"/> </span>
        <span v-for="(item, index) in technology" :key="index + technology.length"><icon :name="item.icon"/></span>
      </div>
    </div>
    <!-- 第二行向右移动 -->
    <div class="marquee-row second-row">
      <div class="marquee-content">
        <span v-for="(item, index) in tools" :key="index"><icon :name="item.icon"/></span>
        <span v-for="(item, index) in tools" :key="index + tools.length"><icon :name="item.icon"/></span>
      </div>
    </div>

    <div class="about-me-skill-detail">
      <span v-for="(item, index) in technology" :key="index"> <icon
          :name="item.icon"/> <span>{{ item.type }}</span>  </span>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue';

// 技能
const technology = ref([
  {type: 'React', icon: 'skill-icons:react-light'},
  {type: 'Vue', icon: 'logos:vue'},
  {type: 'HTML5', icon: 'logos:html-5'},
  {type: 'CSS3', icon: 'logos:css-3'},
  {type: 'Less', icon: 'logos:less'},
  {type: 'JavaScript', icon: 'vscode-icons:file-type-js'},
  {type: 'TypeScript', icon: 'vscode-icons:file-type-typescriptdef'},
  {type: 'C', icon: 'skill-icons:c'},
  {type: 'CPP', icon: 'skill-icons:cpp'},
  {type: 'JAVA', icon: 'skill-icons:java-light'},
  {type: 'Python', icon: 'skill-icons:python-light'},
  {type: 'Go', icon: 'skill-icons:golang'},
  {type: 'Bash', icon: 'skill-icons:bash-light'},
  {type: 'PowerShell', icon: 'skill-icons:powershell-light'},
  {type: 'Spring', icon: 'devicon:spring'},
  {type: 'Flask', icon: 'skill-icons:flask-light'},
  {type: 'FastAPI', icon: 'skill-icons:fastapi'},
  {type: 'MySQL', icon: 'devicon:mysql'},
  {type: 'Redis', icon: 'skill-icons:redis-light'},
  {type: 'PostgreSQL', icon: 'skill-icons:postgresql-light'},
]);

// 工具
const tools = ref([
  {type: 'Jenkins', icon: 'skill-icons:jenkins-light'},
  {type: 'Selenium', icon: 'skill-icons:selenium'},
  {type: 'Anaconda', icon: 'skill-icons:anaconda-light'},
  {type: 'GitHub', icon: 'skill-icons:github-light'},
  {type: 'Git', icon: 'skill-icons:git'},
  {type: 'Eclipse', icon: 'skill-icons:eclipse-light'},
  {type: 'Arduino', icon: 'skill-icons:arduino'},
  {type: 'Postman', icon: 'skill-icons:postman'},
  {type: 'CMake', icon: 'skill-icons:cmake-light'},
  {type: 'Cloudflare', icon: 'skill-icons:cloudflare-light'},
  {type: 'Elasticsearch', icon: 'skill-icons:elasticsearch-light'},
  {type: 'Docker', icon: 'skill-icons:docker'},
  {type: 'Kubernetes', icon: 'skill-icons:kubernetes'},
  {type: 'PyCharm', icon: 'skill-icons:pycharm-light'},
  {type: 'Ubuntu', icon: 'skill-icons:ubuntu-light'},
  {type: 'Raspberry Pi', icon: 'skill-icons:raspberrypi-light'},
  {type: 'Vim', icon: 'skill-icons:vim-light'},
  {type: 'Terraform', icon: 'skill-icons:terraform-light'},
  {type: 'Sublime Text', icon: 'skill-icons:sublime-light'},
  {type: 'Stack Overflow', icon: 'skill-icons:stackoverflow-light'},
  {type: 'OpenCV', icon: 'skill-icons:opencv-light'},
  {type: 'Lua', icon: 'skill-icons:lua-light'},
  {type: 'Jaeger', icon: 'devicon:jaegertracing'},
  {type: 'Visual Studio', icon: 'devicon:visualstudio-wordmark'},
  {type: 'VSCode', icon: 'vscode-icons:file-type-vscode'},
  {type: 'Android Studio', icon: 'devicon:androidstudio'},
  {type: 'pnpm', icon: 'vscode-icons:file-type-light-pnpm'},
  {type: 'npm', icon: 'logos:npm'},
  {type: 'Vite', icon: 'devicon:vitejs'},
  {type: 'IDEA', icon: 'logos:intellij-idea'},
  {type: 'Playwright', icon: 'devicon:playwright'},
]);
</script>

<style scoped>
.about-me-skill {
  position: relative;
  min-height: 316px;
  padding: 20px 0;
  z-index: 1;

  &:hover .marquee-row {
    opacity: 0;
  }

  &:hover .about-me-skill-detail {
    opacity: 1;
  }
}

.about-me-skill-detail {
  position: absolute;
  top: 100px;
  opacity: 0;
  z-index: 2;
  display: flex;
  padding: 0 20px;
  transition: opacity 0.5s;
  flex-wrap: wrap;

  > span {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 6px 6px 0;
    border-radius: 8px;
    padding: 7px;
    font-size: 16px;
    color: var(--vp-c-text-2);
    background-color: var(--home-action-bnt-bg);
  }
}

.marquee-row {
  transition: opacity 0.6s 0.1s;
  width: 105%;
  margin-left: -6px;
  overflow: hidden;
  white-space: nowrap;
  transform: rotateZ(-6deg);
}

.marquee-content {
  display: inline-flex;
  animation: marquee-left 30s linear infinite;

  > span {
    border-radius: 20%;
    align-content: center;
    align-items: center;
    background-color: var(--about-me-skill-item-bg);
    width: 80px;
    height: 80px;
    font-size: 50px;
    margin: 0 10px;
  }

}

.first-row {
  margin-top: 20px;
}

.second-row {
  margin-top: 20px;
}

.second-row .marquee-content {
  animation: marquee-right 50s linear infinite;
}

@keyframes marquee-left {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-50%);
  }
}

@keyframes marquee-right {
  0% {
    transform: translateX(-50%);
  }
  100% {
    transform: translateX(0%);
  }
}
</style>
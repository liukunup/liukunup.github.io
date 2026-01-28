import{_ as s,c as n,d as e,o as i}from"./app-BxVB_gzI.js";const l={};function p(t,a){return i(),n("div",null,[...a[0]||(a[0]=[e(`<h2 id="快速部署" tabindex="-1"><a class="header-anchor" href="#快速部署"><span>快速部署</span></a></h2><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212;"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code class="language-"><span class="line"><span>version: &#39;3.8&#39;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>services:</span></span>
<span class="line"><span>  lobe-chat:</span></span>
<span class="line"><span>    image: lobehub/lobe-chat</span></span>
<span class="line"><span>    container_name: lobe-chat</span></span>
<span class="line"><span>    restart: always</span></span>
<span class="line"><span>    ports:</span></span>
<span class="line"><span>      - &#39;3210:3210&#39;</span></span>
<span class="line"><span>    environment:</span></span>
<span class="line"><span>      OPENAI_API_KEY: sk-xxxx</span></span>
<span class="line"><span>      OPENAI_PROXY_URL: https://api-proxy.com/v1</span></span>
<span class="line"><span>      ACCESS_CODE: lobe66</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,2)])])}const r=s(l,[["render",p]]),d=JSON.parse('{"path":"/ai/app/lobe-chat/","title":"LobeChat","lang":"zh-CN","frontmatter":{"title":"LobeChat","createTime":"2025/10/13 22:05:00","permalink":"/ai/app/lobe-chat/"},"readingTime":{"minutes":0.13,"words":40},"git":{"createdTime":1760719786000,"updatedTime":1760719786000,"contributors":[{"name":"LiuKun/Windows","username":"","email":"liukunup@163.com","commits":1,"avatar":"https://gravatar.com/avatar/93adde9a3709e088c6c4b0bd8763791893e8be4840a992204be1ac5d20e50f0c?d=retro"}]},"filePathRelative":"ai/1.App/lobe-chat.md","headers":[]}');export{r as comp,d as data};

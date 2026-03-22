import{_ as k,c,b as s,a as p,w as a,d,e as i,r as t,o as v}from"./app-CusWr3gD.js";const m={};function u(g,n){const h=t("Tabs"),r=t("Plot");return v(),c("div",null,[n[12]||(n[12]=s("h2",{id:"🚀-部署指南",tabindex:"-1"},[s("a",{class:"header-anchor",href:"#🚀-部署指南"},[s("span",null,"🚀 部署指南")])],-1)),p(h,{id:"3",data:[{id:"Docker"},{id:"Docker Compose"}],active:0},{title0:a(({value:l,isActive:e})=>[...n[0]||(n[0]=[i("Docker",-1)])]),title1:a(({value:l,isActive:e})=>[...n[1]||(n[1]=[i("Docker Compose",-1)])]),tab0:a(({value:l,isActive:e})=>[...n[2]||(n[2]=[s("div",{class:"language-shell line-numbers-mode","data-highlighter":"shiki","data-ext":"shell",style:{"--shiki-light":"#393a34","--shiki-dark":"#dbd7caee","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#121212"}},[s("pre",{class:"shiki shiki-themes vitesse-light vitesse-dark vp-code"},[s("code",{class:"language-shell"},[s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#59873A","--shiki-dark":"#80A665"}},"docker"),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}}," run"),s("span",{style:{"--shiki-light":"#A65E2B","--shiki-dark":"#C99076"}}," -d"),s("span",{style:{"--shiki-light":"#A65E2B","--shiki-dark":"#C99076"}}," \\")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#A65E2B","--shiki-dark":"#C99076"}},"  -p"),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}}," 53:53/udp"),s("span",{style:{"--shiki-light":"#A65E2B","--shiki-dark":"#C99076"}}," \\")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#A65E2B","--shiki-dark":"#C99076"}},"  -p"),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}}," 53:53/tcp"),s("span",{style:{"--shiki-light":"#A65E2B","--shiki-dark":"#C99076"}}," \\")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#A65E2B","--shiki-dark":"#C99076"}},"  -p"),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}}," 8080:8080"),s("span",{style:{"--shiki-light":"#A65E2B","--shiki-dark":"#C99076"}}," \\")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#A65E2B","--shiki-dark":"#C99076"}},"  -v"),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}}," /path/to/dnsmasq.conf:/etc/dnsmasq.conf"),s("span",{style:{"--shiki-light":"#A65E2B","--shiki-dark":"#C99076"}}," \\")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#A65E2B","--shiki-dark":"#C99076"}},"  -v"),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}}," /path/to/dnsmasq.resolv.conf:/etc/dnsmasq.resolv.conf"),s("span",{style:{"--shiki-light":"#A65E2B","--shiki-dark":"#C99076"}}," \\")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#A65E2B","--shiki-dark":"#C99076"}},"  -e"),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}}," HTTP_USER=admin"),s("span",{style:{"--shiki-light":"#A65E2B","--shiki-dark":"#C99076"}}," \\")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#A65E2B","--shiki-dark":"#C99076"}},"  -e"),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}}," HTTP_PASS=pass"),s("span",{style:{"--shiki-light":"#A65E2B","--shiki-dark":"#C99076"}}," \\")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#A65E2B","--shiki-dark":"#C99076"}},"  --log-opt"),s("span",{style:{"--shiki-light":"#B5695977","--shiki-dark":"#C98A7D77"}},' "'),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}},"max-size=100m"),s("span",{style:{"--shiki-light":"#B5695977","--shiki-dark":"#C98A7D77"}},'"'),s("span",{style:{"--shiki-light":"#A65E2B","--shiki-dark":"#C99076"}}," \\")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#A65E2B","--shiki-dark":"#C99076"}},"  --cap-add=NET_ADMIN"),s("span",{style:{"--shiki-light":"#A65E2B","--shiki-dark":"#C99076"}}," \\")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#A65E2B","--shiki-dark":"#C99076"}},"  --restart=unless-stopped"),s("span",{style:{"--shiki-light":"#A65E2B","--shiki-dark":"#C99076"}}," \\")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#A65E2B","--shiki-dark":"#C99076"}},"  --name=dnsmasq"),s("span",{style:{"--shiki-light":"#A65E2B","--shiki-dark":"#C99076"}}," \\")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}},"  jpillora/dnsmasq:latest")])])]),s("div",{class:"line-numbers","aria-hidden":"true",style:{"counter-reset":"line-number 0"}},[s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"})])],-1)])]),tab1:a(({value:l,isActive:e})=>[...n[3]||(n[3]=[s("div",{class:"language-yaml line-numbers-mode","data-highlighter":"shiki","data-ext":"yaml",style:{"--shiki-light":"#393a34","--shiki-dark":"#dbd7caee","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#121212"}},[s("pre",{class:"shiki shiki-themes vitesse-light vitesse-dark vp-code"},[s("code",{class:"language-yaml"},[s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#998418","--shiki-dark":"#B8A965"}},"services"),s("span",{style:{"--shiki-light":"#999999","--shiki-dark":"#666666"}},":")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#998418","--shiki-dark":"#B8A965"}},"  dnsmasq"),s("span",{style:{"--shiki-light":"#999999","--shiki-dark":"#666666"}},":")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#998418","--shiki-dark":"#B8A965"}},"    image"),s("span",{style:{"--shiki-light":"#999999","--shiki-dark":"#666666"}},":"),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}}," jpillora/dnsmasq:latest")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#998418","--shiki-dark":"#B8A965"}},"    container_name"),s("span",{style:{"--shiki-light":"#999999","--shiki-dark":"#666666"}},":"),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}}," dnsmasq")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#998418","--shiki-dark":"#B8A965"}},"    restart"),s("span",{style:{"--shiki-light":"#999999","--shiki-dark":"#666666"}},":"),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}}," unless-stopped")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#998418","--shiki-dark":"#B8A965"}},"    cap_add"),s("span",{style:{"--shiki-light":"#999999","--shiki-dark":"#666666"}},":")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#999999","--shiki-dark":"#666666"}},"      -"),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}}," NET_ADMIN")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#998418","--shiki-dark":"#B8A965"}},"    ports"),s("span",{style:{"--shiki-light":"#999999","--shiki-dark":"#666666"}},":")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#999999","--shiki-dark":"#666666"}},"      -"),s("span",{style:{"--shiki-light":"#B5695977","--shiki-dark":"#C98A7D77"}},' "'),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}},"53:53/udp"),s("span",{style:{"--shiki-light":"#B5695977","--shiki-dark":"#C98A7D77"}},'"')]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#999999","--shiki-dark":"#666666"}},"      -"),s("span",{style:{"--shiki-light":"#B5695977","--shiki-dark":"#C98A7D77"}},' "'),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}},"53:53/tcp"),s("span",{style:{"--shiki-light":"#B5695977","--shiki-dark":"#C98A7D77"}},'"')]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#999999","--shiki-dark":"#666666"}},"      -"),s("span",{style:{"--shiki-light":"#B5695977","--shiki-dark":"#C98A7D77"}},' "'),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}},"8080:8080"),s("span",{style:{"--shiki-light":"#B5695977","--shiki-dark":"#C98A7D77"}},'"')]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#998418","--shiki-dark":"#B8A965"}},"    environment"),s("span",{style:{"--shiki-light":"#999999","--shiki-dark":"#666666"}},":")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#998418","--shiki-dark":"#B8A965"}},"      HTTP_USER"),s("span",{style:{"--shiki-light":"#999999","--shiki-dark":"#666666"}},":"),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}}," ${HTTP_USERNAME:-admin}")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#998418","--shiki-dark":"#B8A965"}},"      HTTP_PASS"),s("span",{style:{"--shiki-light":"#999999","--shiki-dark":"#666666"}},":"),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}}," ${HTTP_PASSWORD:-pass}")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#998418","--shiki-dark":"#B8A965"}},"    volumes"),s("span",{style:{"--shiki-light":"#999999","--shiki-dark":"#666666"}},":")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#999999","--shiki-dark":"#666666"}},"      -"),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}}," /path/to/dnsmasq.conf:/etc/dnsmasq.conf")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#999999","--shiki-dark":"#666666"}},"      -"),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}}," /path/to/dnsmasq.resolv.conf:/etc/dnsmasq.resolv.conf")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#998418","--shiki-dark":"#B8A965"}},"    logging"),s("span",{style:{"--shiki-light":"#999999","--shiki-dark":"#666666"}},":")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#998418","--shiki-dark":"#B8A965"}},"      driver"),s("span",{style:{"--shiki-light":"#999999","--shiki-dark":"#666666"}},":"),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}}," json-file")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#998418","--shiki-dark":"#B8A965"}},"      options"),s("span",{style:{"--shiki-light":"#999999","--shiki-dark":"#666666"}},":")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#998418","--shiki-dark":"#B8A965"}},"        max-size"),s("span",{style:{"--shiki-light":"#999999","--shiki-dark":"#666666"}},":"),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}}," 100m")])])]),s("div",{class:"line-numbers","aria-hidden":"true",style:{"counter-reset":"line-number 0"}},[s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"})])],-1),s("p",null,[i("启动容器 "),s("code",null,"docker compose -p dnsmasq up -d")],-1)])]),_:1}),n[13]||(n[13]=d(`<h2 id="⚙️-配置指南" tabindex="-1"><a class="header-anchor" href="#⚙️-配置指南"><span>⚙️ 配置指南</span></a></h2><h3 id="dnsmasq-conf" tabindex="-1"><a class="header-anchor" href="#dnsmasq-conf"><span><strong>dnsmasq.conf</strong></span></a></h3><div class="language-plaintext line-numbers-mode" data-highlighter="shiki" data-ext="plaintext" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212;"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code class="language-plaintext"><span class="line"><span># =============================================================================</span></span>
<span class="line"><span># dnsmasq 企业级配置文件</span></span>
<span class="line"><span># 版本: 1.0.0</span></span>
<span class="line"><span># 描述: 家庭局域网DNS解析服务配置 - homelab.lan 域</span></span>
<span class="line"><span># =============================================================================</span></span>
<span class="line"><span></span></span>
<span class="line"><span># ========================</span></span>
<span class="line"><span># 局域网域名解析</span></span>
<span class="line"><span># ========================</span></span>
<span class="line"><span></span></span>
<span class="line"><span># --- 精确域名解析 ---</span></span>
<span class="line"><span>address=/codex.homelab.lan/192.168.100.81</span></span>
<span class="line"><span></span></span>
<span class="line"><span># --- 泛域名解析 ---</span></span>
<span class="line"><span>address=/.codex.homelab.lan/192.168.100.81</span></span>
<span class="line"><span></span></span>
<span class="line"><span># ========================</span></span>
<span class="line"><span># 上游DNS服务器</span></span>
<span class="line"><span># ========================</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 指定上游DNS服务器配置文件</span></span>
<span class="line"><span>resolv-file=/etc/dnsmasq.resolv.conf</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 严格按照resolv-file中的顺序查询上游DNS服务器</span></span>
<span class="line"><span>strict-order</span></span>
<span class="line"><span></span></span>
<span class="line"><span># ========================</span></span>
<span class="line"><span># 缓存与性能优化</span></span>
<span class="line"><span># ========================</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 缓存大小（缓存条目数量）</span></span>
<span class="line"><span>cache-size=10000</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 最大缓存时间（秒）</span></span>
<span class="line"><span>max-cache-ttl=3600</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 最小缓存时间（秒）</span></span>
<span class="line"><span>min-cache-ttl=60</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 禁用负值缓存（加快解析失败后的重试）</span></span>
<span class="line"><span>no-negcache</span></span>
<span class="line"><span></span></span>
<span class="line"><span># ========================</span></span>
<span class="line"><span># 日志与调试配置</span></span>
<span class="line"><span># ========================</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 记录所有DNS查询</span></span>
<span class="line"><span>log-queries</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 日志输出文件路径</span></span>
<span class="line"><span>log-facility=/var/log/dnsmasq.log</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 详细日志级别</span></span>
<span class="line"><span>log-dhcp</span></span>
<span class="line"><span>log-async=100</span></span>
<span class="line"><span></span></span>
<span class="line"><span># ========================</span></span>
<span class="line"><span># 安全加固配置</span></span>
<span class="line"><span># ========================</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 禁用DHCP功能（纯DNS服务器）</span></span>
<span class="line"><span>no-dhcp-interface=</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 作为本地服务运行，降低权限</span></span>
<span class="line"><span>local-service</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 阻止Windows 2k特定的DNS请求</span></span>
<span class="line"><span>filterwin2k</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 阻止DNS重绑定攻击</span></span>
<span class="line"><span>stop-dns-rebind</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 伪造的NXDomain响应，用于屏蔽特定IP</span></span>
<span class="line"><span>bogus-nxdomain=223.5.5.5</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 限制查询频率（防止DNS攻击）</span></span>
<span class="line"><span>dns-forward-max=150</span></span>
<span class="line"><span></span></span>
<span class="line"><span># ========================</span></span>
<span class="line"><span># 高级功能配置</span></span>
<span class="line"><span># ========================</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 本地域名设置（简化内网域名输入）</span></span>
<span class="line"><span>local=/homelab.lan/</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 扩展主机名（自动补全域名）</span></span>
<span class="line"><span>expand-hosts</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 域名标签（最多允许的域名组成部分）</span></span>
<span class="line"><span>domain-needed</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 不转发不含域名的简单主机名查询</span></span>
<span class="line"><span>bogus-priv</span></span>
<span class="line"><span></span></span>
<span class="line"><span># ========================</span></span>
<span class="line"><span># 性能调优配置</span></span>
<span class="line"><span># ========================</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 异步操作，提高性能</span></span>
<span class="line"><span>async-dns=yes</span></span>
<span class="line"><span></span></span>
<span class="line"><span># DNS转发并发数</span></span>
<span class="line"><span>dns-forward-max=150</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 重启后清空缓存</span></span>
<span class="line"><span>clear-on-reload</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 服务器组（负载均衡）</span></span>
<span class="line"><span>all-servers</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="dnsmasq-resolv-conf" tabindex="-1"><a class="header-anchor" href="#dnsmasq-resolv-conf"><span><strong>dnsmasq.resolv.conf</strong></span></a></h3><div class="language-plaintext line-numbers-mode" data-highlighter="shiki" data-ext="plaintext" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212;"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code class="language-plaintext"><span class="line"><span># 上游DNS服务器</span></span>
<span class="line"><span>nameserver 114.114.114.114</span></span>
<span class="line"><span>nameserver 223.5.5.5</span></span>
<span class="line"><span>nameserver 119.29.29.29</span></span>
<span class="line"><span></span></span>
<span class="line"><span># DNS查询选项</span></span>
<span class="line"><span>options timeout:2</span></span>
<span class="line"><span>options attempts:3</span></span>
<span class="line"><span>options rotate</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="🔍-测试与验证" tabindex="-1"><a class="header-anchor" href="#🔍-测试与验证"><span>🔍 测试与验证</span></a></h2><h3 id="网页界面管理" tabindex="-1"><a class="header-anchor" href="#网页界面管理"><span>网页界面管理</span></a></h3><p>部署完成后，可通过 http://localhost:8080 访问Web管理界面。</p>`,8)),s("ul",null,[n[6]||(n[6]=s("li",null,[i("用户名："),s("code",null,"admin")],-1)),s("li",null,[n[5]||(n[5]=i("密码：",-1)),p(r,null,{default:a(()=>[...n[4]||(n[4]=[i("请从上述配置取",-1)])]),_:1})]),n[7]||(n[7]=s("li",null,"功能包括：实时监控、动态配置、查询日志查看",-1))]),n[14]||(n[14]=d(`<h3 id="解析功能测试" tabindex="-1"><a class="header-anchor" href="#解析功能测试"><span>解析功能测试</span></a></h3><div class="language-shell line-numbers-mode" data-highlighter="shiki" data-ext="shell" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212;"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code class="language-shell"><span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD;"># 互联网域名解析</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">dig</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> @114.114.114.114</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> baidu.com</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD;">      # dig 使用示例</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">nslookup</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> baidu.com</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91;"> 114.114.114.114</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD;">  # nslookup 使用示例</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD;"># 局域网域名解析</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">dig</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> @localhost</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> coder.homelab.lan</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD;">      # 测试域名解析</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">dig</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> @localhost</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> any.coder.homelab.lan</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD;">  # 测试泛域名解析</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">nslookup</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> coder.homelab.lan</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> localhost</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">nslookup</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> any.coder.homelab.lan</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> localhost</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="⚙️-配置指南-1" tabindex="-1"><a class="header-anchor" href="#⚙️-配置指南-1"><span>⚙️ 配置指南</span></a></h2><h3 id="域名解析配置" tabindex="-1"><a class="header-anchor" href="#域名解析配置"><span><strong>域名解析配置</strong></span></a></h3><ul><li><code>address=/coder.homelab.lan/192.168.100.12</code> - 精确域名解析</li><li><code>address=/.coder.homelab.lan/192.168.100.12</code> - 泛域名解析，匹配所有子域名</li></ul><h3 id="客户端配置" tabindex="-1"><a class="header-anchor" href="#客户端配置"><span><strong>客户端配置</strong></span></a></h3>`,6)),p(h,{id:"76",data:[{id:"Linux"},{id:"Docker"}],active:0},{title0:a(({value:l,isActive:e})=>[...n[8]||(n[8]=[i("Linux",-1)])]),title1:a(({value:l,isActive:e})=>[...n[9]||(n[9]=[i("Docker",-1)])]),tab0:a(({value:l,isActive:e})=>[...n[10]||(n[10]=[s("div",{class:"language-bash line-numbers-mode","data-highlighter":"shiki","data-ext":"bash",style:{"--shiki-light":"#393a34","--shiki-dark":"#dbd7caee","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#121212"}},[s("pre",{class:"shiki shiki-themes vitesse-light vitesse-dark vp-code"},[s("code",{class:"language-bash"},[s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#A0ADA0","--shiki-dark":"#758575DD"}},"# 临时修改")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#59873A","--shiki-dark":"#80A665"}},"sudo"),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}}," systemctl"),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}}," restart"),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}}," systemd-resolved")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#A0ADA0","--shiki-dark":"#758575DD"}},"# 永久修改")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#998418","--shiki-dark":"#B8A965"}},"echo"),s("span",{style:{"--shiki-light":"#B5695977","--shiki-dark":"#C98A7D77"}},' "'),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}},"nameserver 192.168.100.101"),s("span",{style:{"--shiki-light":"#B5695977","--shiki-dark":"#C98A7D77"}},'"'),s("span",{style:{"--shiki-light":"#AB5959","--shiki-dark":"#CB7676"}}," |"),s("span",{style:{"--shiki-light":"#59873A","--shiki-dark":"#80A665"}}," sudo"),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}}," tee"),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}}," /etc/dnsmasq.resolv.conf")])])]),s("div",{class:"line-numbers","aria-hidden":"true",style:{"counter-reset":"line-number 0"}},[s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"})])],-1)])]),tab1:a(({value:l,isActive:e})=>[...n[11]||(n[11]=[s("div",{class:"language-yaml line-numbers-mode","data-highlighter":"shiki","data-ext":"yaml",style:{"--shiki-light":"#393a34","--shiki-dark":"#dbd7caee","--shiki-light-bg":"#ffffff","--shiki-dark-bg":"#121212"}},[s("pre",{class:"shiki shiki-themes vitesse-light vitesse-dark vp-code"},[s("code",{class:"language-yaml"},[s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#998418","--shiki-dark":"#B8A965"}},"services"),s("span",{style:{"--shiki-light":"#999999","--shiki-dark":"#666666"}},":")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#998418","--shiki-dark":"#B8A965"}},"  myapp"),s("span",{style:{"--shiki-light":"#999999","--shiki-dark":"#666666"}},":")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#998418","--shiki-dark":"#B8A965"}},"    image"),s("span",{style:{"--shiki-light":"#999999","--shiki-dark":"#666666"}},":"),s("span",{style:{"--shiki-light":"#B56959","--shiki-dark":"#C98A7D"}}," myapp:latest")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-light":"#998418","--shiki-dark":"#B8A965"}},"    dns"),s("span",{style:{"--shiki-light":"#999999","--shiki-dark":"#666666"}},":"),s("span",{style:{"--shiki-light":"#2F798A","--shiki-dark":"#4C9A91"}}," 192.168.100.101")])])]),s("div",{class:"line-numbers","aria-hidden":"true",style:{"counter-reset":"line-number 0"}},[s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"}),s("div",{class:"line-number"})])],-1)])]),_:1}),n[15]||(n[15]=d(`<h2 id="🔍-维护与故障排查" tabindex="-1"><a class="header-anchor" href="#🔍-维护与故障排查"><span>🔍 维护与故障排查</span></a></h2><ul><li><strong>端口占用</strong></li></ul><div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212;"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code class="language-bash"><span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD;"># 检查53端口是否被占用</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">netstat</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -tulpn</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676;"> |</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665;"> grep</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> :53</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><ul><li><strong>容器网络问题</strong></li></ul><div class="language-bash line-numbers-mode" data-highlighter="shiki" data-ext="bash" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212;"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code class="language-bash"><span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD;"># 检查容器网络</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">docker</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> network</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> ls</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">docker</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> network</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> inspect</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> dns-net</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,5))])}const o=k(m,[["render",u]]),y=JSON.parse('{"path":"/homelab/deploy/dnsmasq/","title":"dnsmasq | HomeLab","lang":"zh-CN","frontmatter":{"title":"dnsmasq","tags":["DNS"],"createTime":"2025/10/30 17:21:37","permalink":"/homelab/deploy/dnsmasq/"},"readingTime":{"minutes":2.58,"words":775},"git":{"createdTime":1761875787000,"updatedTime":1761875787000,"contributors":[{"name":"LiuKun","username":"LiuKun","email":"liukunup@163.com","commits":1,"avatar":"https://avatars.githubusercontent.com/LiuKun?v=4","url":"https://github.com/LiuKun"}]},"filePathRelative":"homelab/2.部署指南/dnsmasq.md","headers":[]}');export{o as comp,y as data};

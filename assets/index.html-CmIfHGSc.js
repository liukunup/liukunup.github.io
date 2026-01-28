import{_ as t,c,d as l,a as r,w as n,r as h,o as v,b as a,e as p}from"./app-BxVB_gzI.js";const o={};function k(u,s){const d=h("Tabs");return v(),c("div",null,[s[4]||(s[4]=l(`<h2 id="🚀-部署指南" tabindex="-1"><a class="header-anchor" href="#🚀-部署指南"><span>🚀 部署指南</span></a></h2><ol><li><p>创建目录用于数据持久化；</p><div class="language-shell line-numbers-mode" data-highlighter="shiki" data-ext="shell" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212;"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code class="language-shell"><span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">mkdir</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -p</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> /opt/bind9/{config,cache,records}</span></span>
<span class="line"><span style="--shiki-light:#998418;--shiki-dark:#B8A965;">cd</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> /opt/bind9</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div></li><li><p>设置目录权限；</p><div class="language-shell line-numbers-mode" data-highlighter="shiki" data-ext="shell" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212;"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code class="language-shell"><span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">chmod</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -R</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91;"> 755</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> /opt/bind9</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">chown</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -R</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> 1000:1000</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> /opt/bind9</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD;">  # 适配镜像的默认用户</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div></li><li><p>通过容器部署；</p></li></ol>`,2)),r(d,{id:"22",data:[{id:"Docker"},{id:"Docker Compose"}],active:0},{title0:n(({value:i,isActive:e})=>[...s[0]||(s[0]=[p("Docker",-1)])]),title1:n(({value:i,isActive:e})=>[...s[1]||(s[1]=[p("Docker Compose",-1)])]),tab0:n(({value:i,isActive:e})=>[...s[2]||(s[2]=[a("pre",null,[a("code",null,`\`\`\`shell
docker run -d \\
  -p 53:53 \\
  -v /opt/bind9/config:/etc/bind \\
  -v /opt/bind9/cache:/var/cache/bind \\
  -v /opt/bind9/records:/var/lib/bind \\
  -e TZ=Asia/Shanghai \\
  -e BIND9_USER=bind \\
  --restart=unless-stopped \\
  --name=bind9 \\
  ubuntu/bind9:9.18-24.04_beta
\`\`\`
`)],-1)])]),tab1:n(({value:i,isActive:e})=>[...s[3]||(s[3]=[a("pre",null,[a("code",null,`\`\`\`yaml
services:
  bind9:
    image: ubuntu/bind9:9.18-24.04_beta
    container_name: bind9
    restart: unless-stopped
    ports:
      - "53:53"
    volumes:
      - /opt/bind9/config:/etc/bind
      - /opt/bind9/cache:/var/cache/bind
      - /opt/bind9/records:/var/lib/bind
    environment:
      - TZ=Asia/Shanghai
      - BIND9_USER=bind
\`\`\`

启动服务 \`docker-compose -p bind9 up -d\`
`)],-1)])]),_:1}),s[5]||(s[5]=l(`<h2 id="⚙️-配置指南" tabindex="-1"><a class="header-anchor" href="#⚙️-配置指南"><span>⚙️ 配置指南</span></a></h2><div class="vp-steps"><ol><li><p>主配置文件</p><p>创建或修改 <code>/opt/bind9/config/named.conf</code></p><div class="language-plaintext line-numbers-mode" data-highlighter="shiki" data-ext="plaintext" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212;"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code class="language-plaintext"><span class="line"><span>// BIND9 主配置文件</span></span>
<span class="line"><span>options {</span></span>
<span class="line"><span>    directory &quot;/var/lib/bind&quot;;</span></span>
<span class="line"><span>    pid-file &quot;/var/run/named/named.pid&quot;;</span></span>
<span class="line"><span>    session-keyfile &quot;/var/run/named/session.key&quot;;</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 监听配置</span></span>
<span class="line"><span>    listen-on port 53 { any; };</span></span>
<span class="line"><span>    listen-on-v6 port 53 { none; };</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 访问控制</span></span>
<span class="line"><span>    allow-query { any; };</span></span>
<span class="line"><span>    allow-recursion { any; };</span></span>
<span class="line"><span>    allow-query-cache { any; };</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 转发器配置（外网DNS）</span></span>
<span class="line"><span>    forwarders { </span></span>
<span class="line"><span>        114.114.114.114;</span></span>
<span class="line"><span>        223.5.5.5;</span></span>
<span class="line"><span>    };</span></span>
<span class="line"><span>    forward only;</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // DNSSEC配置</span></span>
<span class="line"><span>    dnssec-validation auto;</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 性能调优</span></span>
<span class="line"><span>    max-cache-size 256M;</span></span>
<span class="line"><span>    max-udp-size 4096;</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 日志配置</span></span>
<span class="line"><span>    version &quot;DNS Server - homelab.lan&quot;;</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 区域文件包含</span></span>
<span class="line"><span>include &quot;/etc/bind/named.conf.local&quot;;</span></span>
<span class="line"><span>include &quot;/etc/bind/named.conf.options&quot;;</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li><p>区域配置文件</p><p>创建<code>/opt/bind9/config/named.conf.local</code></p><div class="language-plaintext line-numbers-mode" data-highlighter="shiki" data-ext="plaintext" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212;"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code class="language-plaintext"><span class="line"><span>// homelab.lan 正向区域</span></span>
<span class="line"><span>zone &quot;homelab.lan&quot; {</span></span>
<span class="line"><span>    type master;</span></span>
<span class="line"><span>    file &quot;/etc/bind/zones/db.homelab.lan&quot;;</span></span>
<span class="line"><span>    allow-transfer { none; };</span></span>
<span class="line"><span>    allow-update { none; };</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 反向解析区域（可选）</span></span>
<span class="line"><span>zone &quot;100.168.192.in-addr.arpa&quot; {</span></span>
<span class="line"><span>    type master;</span></span>
<span class="line"><span>    file &quot;/etc/bind/zones/db.192.168.100&quot;;</span></span>
<span class="line"><span>    allow-transfer { none; };</span></span>
<span class="line"><span>};</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li><p>区域数据文件</p><p>创建<code>/opt/bind9/zones/db.homelab.lan</code></p><div class="language-plaintext line-numbers-mode" data-highlighter="shiki" data-ext="plaintext" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212;"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code class="language-plaintext"><span class="line"><span>; homelab.lan 区域文件</span></span>
<span class="line"><span>$TTL    604800</span></span>
<span class="line"><span>@       IN      SOA     ns1.homelab.lan. admin.homelab.lan. (</span></span>
<span class="line"><span>                              2024103001 ; 序列号</span></span>
<span class="line"><span>                                  10800 ; 刷新时间 3小时</span></span>
<span class="line"><span>                                  3600 ; 重试时间 1小时</span></span>
<span class="line"><span>                                604800 ; 过期时间 1周</span></span>
<span class="line"><span>                                  86400 ; 最小TTL 1天</span></span>
<span class="line"><span>                                  )</span></span>
<span class="line"><span></span></span>
<span class="line"><span>; 名称服务器记录</span></span>
<span class="line"><span>@       IN      NS      ns1.homelab.lan.</span></span>
<span class="line"><span>ns1     IN      A       192.168.100.1</span></span>
<span class="line"><span></span></span>
<span class="line"><span>; A记录定义</span></span>
<span class="line"><span>@       IN      A       192.168.100.1</span></span>
<span class="line"><span>ikuai   IN      A       192.168.100.1</span></span>
<span class="line"><span></span></span>
<span class="line"><span>; 开发工具域名</span></span>
<span class="line"><span>coder   IN      A       192.168.100.12</span></span>
<span class="line"><span>*.coder IN      A       192.168.100.12</span></span>
<span class="line"><span>vscode  IN      A       192.168.100.13</span></span>
<span class="line"><span></span></span>
<span class="line"><span>; 其他服务可以在此添加</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>创建反向解析文件<code>/opt/bind9/zones/db.192.168.100</code></p><div class="language-plaintext line-numbers-mode" data-highlighter="shiki" data-ext="plaintext" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212;"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code class="language-plaintext"><span class="line"><span>; 192.168.100.0/24 反向区域文件</span></span>
<span class="line"><span>$TTL    604800</span></span>
<span class="line"><span>@       IN      SOA     ns1.homelab.lan. admin.homelab.lan. (</span></span>
<span class="line"><span>                              2024103001</span></span>
<span class="line"><span>                                  10800</span></span>
<span class="line"><span>                                  3600</span></span>
<span class="line"><span>                                604800</span></span>
<span class="line"><span>                                  86400</span></span>
<span class="line"><span>                                  )</span></span>
<span class="line"><span></span></span>
<span class="line"><span>@       IN      NS      ns1.homelab.lan.</span></span>
<span class="line"><span></span></span>
<span class="line"><span>; PTR记录</span></span>
<span class="line"><span>1       IN      PTR     ikuai.homelab.lan.</span></span>
<span class="line"><span>12      IN      PTR     coder.homelab.lan.</span></span>
<span class="line"><span>13      IN      PTR     vscode.homelab.lan.</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li><p>权限与验证</p><p>设置文件权限</p><div class="language-shell line-numbers-mode" data-highlighter="shiki" data-ext="shell" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212;"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code class="language-shell"><span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">chmod</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91;"> 644</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> /opt/bind9/zones/db.</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;">*</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>验证配置文件语法</p><div class="language-shell line-numbers-mode" data-highlighter="shiki" data-ext="shell" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212;"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code class="language-shell"><span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">docker</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> exec</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> bind9-server</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> named-checkconf</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">docker</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> exec</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> bind9-server</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> named-checkzone</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> homelab.lan</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> /etc/bind/zones/db.homelab.lan</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div></li></ol></div><h2 id="🎯-客户端配置" tabindex="-1"><a class="header-anchor" href="#🎯-客户端配置"><span>🎯 客户端配置</span></a></h2><p>配置客户端使用您的DNS服务器</p><ul><li><strong>Linux</strong>: 在<code>/etc/resolv.conf</code>中添加<code>nameserver 192.168.100.1</code></li><li><strong>Windows</strong>: 在网络适配器设置中指定DNS服务器地址</li><li><strong>路由器</strong>: 在DHCP设置中将DNS服务器指向<code>192.168.100.1</code></li></ul><h2 id="🔍-测试与验证" tabindex="-1"><a class="header-anchor" href="#🔍-测试与验证"><span>🔍 测试与验证</span></a></h2><h3 id="正向解析测试" tabindex="-1"><a class="header-anchor" href="#正向解析测试"><span>正向解析测试</span></a></h3><p>使用以下命令测试DNS解析</p><pre><code>\`\`\`shell
# 测试基础域名解析
nslookup homelab.lan 192.168.100.1

# 测试具体域名
nslookup coder.homelab.lan 192.168.100.1
nslookup test.coder.homelab.lan 192.168.100.1  # 通配符测试
nslookup vscode.homelab.lan 192.168.100.1
nslookup ikuai.homelab.lan 192.168.100.1

# 使用dig命令进行详细查询
dig @192.168.100.1 coder.homelab.lan A
\`\`\`
</code></pre><h3 id="反向解析测试" tabindex="-1"><a class="header-anchor" href="#反向解析测试"><span>反向解析测试</span></a></h3><pre><code>\`\`\`shell
nslookup 192.168.100.12 192.168.100.1
nslookup 192.168.100.13 192.168.100.1
\`\`\`
</code></pre><h2 id="📊-监控配置" tabindex="-1"><a class="header-anchor" href="#📊-监控配置"><span>📊 监控配置</span></a></h2><ul><li><p>prometheus</p><p>创建<code>/opt/bind9/config/named.conf.options</code>启用统计通道</p><div class="language-shell line-numbers-mode" data-highlighter="shiki" data-ext="shell" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212;"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code class="language-shell"><span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">options</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> {</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;">        </span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">    //</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> 统计通道配置</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">    statistics-channels</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> {</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">        inet</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91;"> 127.0.0.1</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> port</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91;"> 8053</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> allow</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> {</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91;"> 127.0.0.1</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">;</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;"> }</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">;</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;">    }</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">;</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;">};</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li></ul>`,13))])}const m=t(o,[["render",k]]),g=JSON.parse('{"path":"/homelab/deploy/bind9/","title":"BIND 9","lang":"zh-CN","frontmatter":{"title":"BIND 9","tags":["DNS"],"createTime":"2025/10/30 15:58:25","permalink":"/homelab/deploy/bind9/"},"readingTime":{"minutes":2.29,"words":686},"git":{"createdTime":1761814718000,"updatedTime":1761815806000,"contributors":[{"name":"LiuKun","username":"LiuKun","email":"liukunup@163.com","commits":2,"avatar":"https://avatars.githubusercontent.com/LiuKun?v=4","url":"https://github.com/LiuKun"}]},"filePathRelative":"homelab/2.部署指南/bind9.md","headers":[]}');export{m as comp,g as data};

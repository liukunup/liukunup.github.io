import{_ as a,c as u,a as l,b as o,d as r,w as n,r as d,o as v}from"./app-Dcft7Xc2.js";const m={};function p(c,e){const i=d("Tabs");return v(),u("div",null,[e[14]||(e[14]=l("h2",{id:"常见问题",tabindex:"-1"},[l("a",{class:"header-anchor",href:"#常见问题"},[l("span",null,"常见问题")])],-1)),e[15]||(e[15]=l("ul",null,[l("li",null,[r("容器配置"),l("code",null,"/etc/hosts")])],-1)),o(i,{id:"10",data:[{id:"Docker"},{id:"Docker Compose"}],active:0},{title0:n(({value:t,isActive:s})=>[...e[0]||(e[0]=[r("Docker",-1)])]),title1:n(({value:t,isActive:s})=>[...e[1]||(e[1]=[r("Docker Compose",-1)])]),tab0:n(({value:t,isActive:s})=>[...e[2]||(e[2]=[l("pre",null,[l("code",null,"```shell\ndocker run \\\n  --add-host subdomain.yourdomain.lan:192.168.100.88 \\\n  hello-world\n```\n")],-1)])]),tab1:n(({value:t,isActive:s})=>[...e[3]||(e[3]=[l("pre",null,[l("code",null,`\`\`\`yaml
services:
  myapp:
    image: hello-world
    extra_hosts:
      - "subdomain.yourdomain.lan:192.168.100.88"
\`\`\`
`)],-1)])]),_:1}),e[16]||(e[16]=l("ul",null,[l("li",null,"容器配置 DNS 服务器")],-1)),o(i,{id:"25",data:[{id:"Docker"},{id:"Docker Compose"}],active:0},{title0:n(({value:t,isActive:s})=>[...e[4]||(e[4]=[r("Docker",-1)])]),title1:n(({value:t,isActive:s})=>[...e[5]||(e[5]=[r("Docker Compose",-1)])]),tab0:n(({value:t,isActive:s})=>[...e[6]||(e[6]=[l("pre",null,[l("code",null,"```shell\ndocker run \\\n  --dns 114.114.114.114 \\\n  --dns 8.8.8.8 \\\n  hello-world\n```\n")],-1)])]),tab1:n(({value:t,isActive:s})=>[...e[7]||(e[7]=[l("pre",null,[l("code",null,`\`\`\`yaml
services:
  myapp:
    image: hello-world
    dns:
      - 114.114.114.114
      - 8.8.8.8
    dns_search:
      - subdomain.yourdomain.lan
\`\`\`
`)],-1)])]),_:1}),e[17]||(e[17]=l("ul",null,[l("li",null,"容器配置证书")],-1)),o(i,{id:"40",data:[{id:"镜像构建时(推荐)"},{id:"挂载主机目录(共享)"},{id:"直接挂载证书"}],active:0},{title0:n(({value:t,isActive:s})=>[...e[8]||(e[8]=[r("镜像构建时(推荐)",-1)])]),title1:n(({value:t,isActive:s})=>[...e[9]||(e[9]=[r("挂载主机目录(共享)",-1)])]),title2:n(({value:t,isActive:s})=>[...e[10]||(e[10]=[r("直接挂载证书",-1)])]),tab0:n(({value:t,isActive:s})=>[...e[11]||(e[11]=[l("pre",null,[l("code",null,"```dockerfile\n# 复制证书\nCOPY ssl/certs/ca.crt /usr/local/share/ca-certificates/\n# 更新证书\nRUN update-ca-certificates\n```\n")],-1)])]),tab1:n(({value:t,isActive:s})=>[...e[12]||(e[12]=[l("pre",null,[l("code",null,`\`\`\`yaml
services:
  myapp:
    image: hello-world
    volumes:
      - /etc/ssl/certs:/etc/ssl/certs:ro
\`\`\`
`)],-1)])]),tab2:n(({value:t,isActive:s})=>[...e[13]||(e[13]=[l("pre",null,[l("code",null,`通常情况下都有效，但是不推荐！

\`\`\`yaml
services:
  myapp:
    image: hello-world
    volumes:
      - ./certs/server.crt:/etc/ssl/certs/server.crt:ro
      - ./certs/server.key:/etc/ssl/private/server.key:ro
      - ./certs/ca.crt:/etc/ssl/certs/ca.crt:ro
    environment:
      - SSL_CERT_FILE=/etc/ssl/certs/server.crt
      - SSL_KEY_FILE=/etc/ssl/private/server.key
\`\`\`
`)],-1)])]),_:1})])}const b=a(m,[["render",p]]),y=JSON.parse('{"path":"/blog/v8unuhyp/","title":"Docker","lang":"zh-CN","frontmatter":{"title":"Docker","createTime":"2025/10/31 22:47:49","permalink":"/blog/v8unuhyp/"},"readingTime":{"minutes":0.57,"words":171},"git":{"createdTime":1761993965000,"updatedTime":1761993965000,"contributors":[{"name":"LiuKun","username":"LiuKun","email":"liukunup@163.com","commits":1,"avatar":"https://avatars.githubusercontent.com/LiuKun?v=4","url":"https://github.com/LiuKun"}]},"filePathRelative":"blog/docker.md","headers":[],"categoryList":[]}');export{b as comp,y as data};

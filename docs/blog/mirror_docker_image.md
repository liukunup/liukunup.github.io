---
title: Mirror Docker Image
tags:
  - docker
  - registry
  - shell
createTime: 2025/10/25 13:39:38
permalink: /blog/boi7ki5g/
---

> 将镜像列表中的本地镜像推送到指定的远程仓库，作为缓存备用。

```shell
#!/bin/bash

# 镜像列表
IMAGES=(
    "nginx:latest"
)

# 目标仓库
REGISTRY="reg.example.com:5000"

# 默认仓库
DEFAULT_REPO="docker.io"

# 仓库列表
REPOS=(
    "ghcr.io"
    "lscr.io"
    "quay.io"
    "nvcr.io"
    "k8s.gcr.io"
    "gcr.io"
    "registry.k8s.io"
)

# 日志文件
LOG_FILE="mirror_docker_images.log"

# 开始时间
start_time=$(date +%s)

echo "开始镜像同步任务..."
echo "开始时间: $(date)" | tee -a "${LOG_FILE}"
echo "总共需要处理 ${#IMAGES[@]} 个镜像" | tee -a "${LOG_FILE}"
echo "========================================" | tee -a "${LOG_FILE}"

# 计数器
success_count=0
failed_count=0

# 遍历镜像列表进行操作
for image in "${IMAGES[@]}"; do
    echo "正在处理镜像: ${image}" | tee -a "${LOG_FILE}"

    # 添加仓库前缀
    target_image="${REGISTRY}/${DEFAULT_REPO}/${image}"  # 默认使用 docker.io

    for repo in "${REPOS[@]}"; do
        if [[ ${image} == ${repo}/* ]]; then
            target_image="${REGISTRY}/${image}"
            break
        fi
    done

    echo "目标镜像: ${target_image}" | tee -a "${LOG_FILE}"

    # 1. 重新标记
    echo "步骤1: 重新标记镜像..." | tee -a "${LOG_FILE}"
    docker tag "${image}" "${target_image}"

    if [ $? -eq 0 ]; then
        echo "✓ 标记成功: ${image} -> ${target_image}" | tee -a "${LOG_FILE}"
    else
        echo "✗ 标记失败: ${image}" | tee -a "${LOG_FILE}"
        ((failed_count++))
        continue
    fi

    # 2. 推送镜像
    echo "步骤2: 推送镜像..." | tee -a "${LOG_FILE}"
    docker push "${target_image}"

    if [ $? -eq 0 ]; then
        echo "✓ 推送成功: ${target_image}" | tee -a "${LOG_FILE}"
        ((success_count++))
    else
        echo "✗ 推送失败: ${target_image}" | tee -a "${LOG_FILE}"
        ((failed_count++))
        # 即使推送失败，也继续尝试删除标记
    fi

    # 3. 删除标记
    echo "步骤3: 删除标记..." | tee -a "${LOG_FILE}"
    docker rmi "${target_image}"

    if [ $? -eq 0 ]; then
        echo "✓ 删除标记成功: ${target_image}" | tee -a "${LOG_FILE}"
    else
        echo "✗ 删除标记失败: ${target_image}" | tee -a "${LOG_FILE}"
    fi

    echo "----------------------------------------" | tee -a "${LOG_FILE}"
done

# 结束时间
end_time=$(date +%s)
duration=$((end_time - start_time))

echo "========================================" | tee -a "${LOG_FILE}"
echo "镜像同步任务完成!" | tee -a "${LOG_FILE}"
echo "完成时间: $(date)" | tee -a "${LOG_FILE}"
echo "总耗时: ${duration}秒" | tee -a "${LOG_FILE}"
echo "成功: ${success_count} 个镜像" | tee -a "${LOG_FILE}"
echo "失败: ${failed_count} 个镜像" | tee -a "${LOG_FILE}"
echo "详细日志请查看: ${LOG_FILE}" | tee -a "${LOG_FILE}"
```

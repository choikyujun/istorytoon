#!/bin/bash
# Vercel 빌드 스크립트 - 환경변수를 env.js에 주입
echo "window.__HF_KEY__ = '${HF_API_KEY}';" > env.js
echo "빌드 완료: env.js 생성됨"

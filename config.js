/**
 * iStoryToon - 환경 설정
 * Supabase 프로젝트 정보 (공개 키만 포함 - 안전)
 * Claude/OpenAI API 키는 Edge Function 환경변수에서만 관리
 */

export const SUPABASE_URL = 'https://tphagookafjldzvxaxui.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_IqYQq0XqJCz6ZdROfokIMA_GeltPVZq';

// HuggingFace API Key는 .env.local에서 관리 (배포 시 Vercel 환경변수로 설정)
// 개발: .env.local 파일에 HF_API_KEY=hf_xxx 형태로 저장
export const HF_API_KEY = window.__HF_KEY__ || '';

// 앱 메타
export const APP_VERSION = '1.0.0';
export const APP_NAME = 'iStoryToon';

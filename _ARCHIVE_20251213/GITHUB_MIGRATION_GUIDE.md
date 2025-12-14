# GitHub 저장소 마이그레이션 가이드

## 📊 현재 상황

### ✅ 완료된 작업
- 모든 SaaS 기능이 로컬에 커밋됨 (16개 파일, 2732줄 추가)
- 개인 GitHub 저장소에 백업 완료: https://github.com/LukeParkXRX/OntologyHub.ai
- Git 설정이 회사 계정으로 변경됨 (info@xrx.studio)

### ⚠️ 해결 필요
- 회사 GitHub 저장소 `XRXStudioGit/OntologyHub.ai`가 아직 생성되지 않았거나 접근 권한이 없음

---

## 🎯 회사 GitHub 저장소 설정 방법

### 옵션 1: 새 저장소 생성 (권장)

1. **GitHub에 로그인**
   - https://github.com 접속
   - 계정: `info@xrx.studio` / 비밀번호: `xrxstudio1004`

2. **조직(Organization) 확인**
   - 상단 우측 프로필 클릭
   - "Your organizations" 선택
   - `XRXStudioGit` 조직이 있는지 확인
   - 없다면 "New organization" 클릭하여 생성

3. **저장소 생성**
   - 조직 페이지에서 "New repository" 클릭
   - Repository name: `OntologyHub.ai` (대소문자 정확히)
   - Description: "SaaS platform for ontology-based knowledge graph generation"
   - Public 또는 Private 선택
   - **중요**: "Initialize this repository" 옵션들은 체크하지 마세요 (빈 저장소로 생성)
   - "Create repository" 클릭

4. **로컬에서 푸시**
   ```bash
   cd "/Users/luke_m1pro/Library/Mobile Documents/com~apple~CloudDocs/Antigravity_Dev/OntologyHub.AI"
   
   # 현재 remote 확인
   git remote -v
   
   # 회사 GitHub으로 변경 (이미 설정되어 있음)
   git remote set-url origin https://github.com/XRXStudioGit/OntologyHub.ai.git
   
   # 푸시
   git push -u origin main
   ```

### 옵션 2: 기존 저장소가 있는 경우

저장소가 이미 존재하지만 접근할 수 없는 경우:

1. **권한 확인**
   - 조직 관리자에게 연락
   - `info@xrx.studio` 계정에 저장소 접근 권한 요청
   - 최소 "Write" 권한 필요

2. **Personal Access Token 생성** (HTTPS 푸시용)
   - GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - "Generate new token (classic)" 클릭
   - Note: "OntologyHub.ai Development"
   - Expiration: 90 days 또는 No expiration
   - Scopes 선택:
     - ✅ `repo` (전체 선택)
     - ✅ `workflow`
   - "Generate token" 클릭
   - **토큰을 복사하여 안전하게 보관** (다시 볼 수 없음)

3. **토큰으로 푸시**
   ```bash
   # Remote URL을 토큰 포함 형식으로 변경
   git remote set-url origin https://TOKEN@github.com/XRXStudioGit/OntologyHub.ai.git
   
   # 푸시
   git push -u origin main
   ```

### 옵션 3: SSH 키 사용 (권장 - 장기적)

1. **SSH 키 생성**
   ```bash
   ssh-keygen -t ed25519 -C "info@xrx.studio"
   # Enter 3번 (기본 경로, 비밀번호 없음)
   ```

2. **공개 키 복사**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   # 출력된 내용 전체 복사
   ```

3. **GitHub에 SSH 키 추가**
   - GitHub Settings → SSH and GPG keys
   - "New SSH key" 클릭
   - Title: "OntologyHub.ai Development Mac"
   - Key: 복사한 공개 키 붙여넣기
   - "Add SSH key" 클릭

4. **Remote URL을 SSH로 변경**
   ```bash
   git remote set-url origin git@github.com:XRXStudioGit/OntologyHub.ai.git
   git push -u origin main
   ```

---

## 📋 현재 Git 설정 정보

```bash
# Git 사용자 정보
User: XRX Studio
Email: info@xrx.studio

# Remote 저장소
Origin: https://github.com/LukeParkXRX/OntologyHub.ai.git (현재 개인 저장소)
Target: https://github.com/XRXStudioGit/OntologyHub.ai.git (회사 저장소)

# 최신 커밋
Commit: ac3bc50
Message: "feat: Add SaaS multi-domain data collection service"
Files: 16 files changed, 2732 insertions(+)
```

---

## 🔄 마이그레이션 체크리스트

### 1단계: 회사 저장소 준비
- [ ] GitHub에 로그인 (info@xrx.studio)
- [ ] XRXStudioGit 조직 확인/생성
- [ ] OntologyHub.ai 저장소 생성 (빈 저장소)
- [ ] 또는 기존 저장소 접근 권한 확인

### 2단계: 로컬 설정
- [x] Git 사용자 정보 변경 완료
- [x] 모든 변경사항 커밋 완료
- [ ] Remote URL 회사 저장소로 변경
- [ ] 푸시 테스트

### 3단계: 검증
- [ ] 회사 GitHub에서 코드 확인
- [ ] README.md 업데이트
- [ ] 팀원들에게 저장소 공유
- [ ] CI/CD 설정 (선택사항)

---

## 🚨 문제 해결

### "Repository not found" 오류
**원인**: 저장소가 없거나 접근 권한 없음
**해결**: 
1. 저장소 URL 확인 (대소문자 정확히)
2. 조직 멤버십 확인
3. Personal Access Token 사용

### "Permission denied" 오류
**원인**: 인증 실패
**해결**:
1. GitHub 로그인 확인
2. SSH 키 또는 Personal Access Token 사용
3. 저장소 권한 확인 (최소 Write 필요)

### "Failed to push" 오류
**원인**: 원격 저장소에 로컬에 없는 커밋이 있음
**해결**:
```bash
git pull origin main --rebase
git push -u origin main
```

---

## 📞 다음 단계

1. **즉시 실행**: 위의 옵션 1을 따라 회사 GitHub 저장소 생성
2. **푸시 완료 후**: 
   - README.md에 회사 정보 업데이트
   - 팀원 초대
   - Branch protection rules 설정
3. **장기적**: 
   - CI/CD 파이프라인 구축
   - 이슈 템플릿 생성
   - 프로젝트 보드 설정

---

## 💡 추천 사항

### 개인 저장소 유지
- 현재 개인 저장소는 백업용으로 유지
- 회사 저장소를 메인으로 사용
- 정기적으로 양쪽 동기화

### 브랜치 전략
```
main (프로덕션)
  ├── develop (개발)
  │   ├── feature/domain-management
  │   ├── feature/data-export
  │   └── feature/subscription
  └── hotfix/critical-bugs
```

### 커밋 메시지 규칙
```
feat: 새로운 기능
fix: 버그 수정
docs: 문서 변경
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드/설정 변경
```

---

**현재 상태**: 모든 코드가 개인 GitHub에 안전하게 백업되어 있습니다. 회사 저장소 생성 후 즉시 마이그레이션 가능합니다! 🚀

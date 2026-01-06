# Project ALIVE: Digital Mind Uploading Platform

> **"정보에서 본질로 (From Information to Essence)."**
> 
> OntologyHub.AI는 단순한 정보 저장소를 넘어, 사용자의 자아(Self)를 디지털 공간에 복제하고 보존하는 **Project ALIVE**로 진화했습니다.

## 🌟 비전 (Vision)
인간의 기억(Memory), 가치관(Value), 성격(Personality)을 구조화된 데이터(Ontology)로 변환하여 영속적인 **"디지털 소울(Digital Soul)"**을 구축합니다.  
사용자는 수동적으로 데이터를 입력하는 것이 아니라, 먼저 말을 걸어오는 AI(Genesis Interviewer)와의 대화를 통해 자신의 정체성을 탐구하고 시각화합니다.

---

## 🚀 주요 기능 (Key Features)

### 🧠 백엔드 (The Brain)
시스템의 지능과 기억을 담당하는 핵심 엔진입니다.

- **정밀 개념 추출 (Gemini 2.0 Flash)**
    - **팩트 기반 술어**: `RELATED`와 같은 모호한 연결을 배제하고, `FOUNDED_BY`, `ACQUIRED` 등 팩트에 기반한 구체적인 술어(Verb phrase)를 추출하여 지식의 높은 가독성과 정합성 확보.
    - **클러스터 브리징 (성단 로직)**: 파편화된 지식 섬들을 `ROOT_CONCEPT_OF` 관계를 통해 메인 키워드에 강제 결합하여 하나의 거대한 '지식 성단' 구축.
- **4계층 온톨로지 스키마 (ALIVE 모델)**
    - **Semantic, Episodic, Psychometric, Kinetic** 레이어를 통한 다각적 자아 구조화.

### 🪞 프런트엔드 (The Mirror)
디지털 자아를 마주하는 몰입형 인터페이스입니다.

- **무중력 3D 시각화 (SF 미학)**
    - **Zero-G Physics**: 무중력 상태를 모사한 탄성 물리 엔진을 통해 노드들이 역동적이면서도 안정적으로 부유하는 시각적 연출.
    - **Luminous Beams & Particles**: 빛나는 네온 광선과 데이터 흐름을 시각화하는 입자 애니메이션을 통해 미래지향적 감성 구현.
- **HUD 스타일 몰입형 UX**
    - **Immersive Mode**: 모든 UI 요소를 숨기고 지식 그래프의 심연에만 집중할 수 있는 시각화 모드.
    - **Glassmorphism 2.0**: 고해상도 `backdrop-blur`를 통해 그래프와 인터페이스가 유기적으로 겹쳐 보이는 몰입감 선사.

---

## 🛠 기술 스택 (Tech Stack)

| 구분 | 기술 | 설명 |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14** | App Router, SSR/CSR Hybrid, Framer Motion |
| | **TypeScript** | 엄격한 타입 안정성 |
| | **Three.js** | 고급 3D 렌더링 |
| **Backend** | **Python FastAPI** | 고성능 비동기 API 프레임워크 |
| | **Gemini 2.0 Flash** | 최신 LLM (추출 및 추론) |
| | **Neo4j (AuraDB)** | 클라우드 네이티브 그래프 DB |

---

## 📦 개발 가이드 (Development Guide)

현재 구조는 **프런트엔드 폴더 하위에 백엔드 가 위치**하는 형태입니다 (`frontend/backend`).

### 1. 설치 및 로컬 실행

**루트 디렉토리에서 한 번에 실행:**
```bash
npm install
npm run dev
```
이 명령어는 `concurrently`를 사용하여 프런트엔드와 백엔드를 동시에 실행합니다.

**개별 실행:**

1. **프런트엔드:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **백엔드:**
   ```bash
   cd frontend/backend
   pip install -r requirements.txt
   uvicorn server:app --reload --port 8000
   ```

### 2. 배포 및 업데이트 루틴
본 리포지토리는 GitHub를 통해 관리됩니다.

1. 작업 전: `git pull origin main`
2. 작업 후: 
   ```bash
   git add .
   git commit -m "작업 내용 요약"
   git push origin main
   ```

---
*모든 설명과 가이드가 한국어로 업데이트되었습니다.*

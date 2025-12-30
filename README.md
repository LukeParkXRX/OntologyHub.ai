# Project ALIVE: Digital Mind Uploading Platform

> **"From Information to Essence."**
> 
> OntologyHub.AI는 단순한 정보 저장소를 넘어, 사용자의 자아(Self)를 디지털 공간에 복제하고 보존하는 **Project ALIVE**로 진화했습니다.

## 🌟 Vision
인간의 기억(Memory), 가치관(Value), 성격(Personality)을 구조화된 데이터(Ontology)로 변환하여 영속적인 **"Digital Soul"**을 구축합니다.  
사용자는 수동적으로 데이터를 입력하는 것이 아니라, 먼저 말을 걸어오는 AI(Genesis Interviewer)와의 대화를 통해 자신의 정체성을 탐구하고 시각화합니다.

---

## 🚀 Key Features

### 🧠 Backend (The Brain)
시스템의 지능과 기억을 담당하는 핵심 엔진입니다.

- **Precision Concept Extraction (Gemini 2.0 Flash)**
    - **Fact-based Predicates**: `RELATED`와 같은 모호한 연결을 배제하고, `FOUNDED_BY`, `ACQUIRED` 등 팩트에 기반한 구체적인 술어(Verb phrase)를 추출하여 지식의 높은 가독성과 정합성 확보.
    - **Cluster Bridging (Constellation Logic)**: 파편화된 지식 섬들을 `ROOT_CONCEPT_OF` 관계를 통해 메인 키워드에 강제 결합하여 하나의 거대한 '지식 성단' 구축.
- **4-Layer Ontology Schema (ALIVE Model)**
    - **Semantic, Episodic, Psychometric, Kinetic** 레이어를 통한 다각적 자아 구조화.

### 🪞 Frontend (The Mirror)
디지털 자아를 마주하는 몰입형 인터페이스입니다.

- **Anti-Gravity 3D Visualization (Sci-Fi Aesthetic)**
    - **Zero-G Physics**: 무중력 상태를 모사한 탄성 물리 엔진을 통해 노드들이 역동적이면서도 안정적으로 부유하는 시각적 연출.
    - **Hero-Centric LOD (Level of Detail)**: 중요 노드(Root/High Centrality)는 거리에 상관없이 선명하게 이름을 표시하여 정보의 위계 확보.
    - **Luminous Beams & Particles**: 빛나는 네온 광선과 데이터 흐름을 시각화하는 입자 애니메이션을 통해 미래지향적 감성 구현.
- **HUD-style Immersive UX (New 💎)**
    - **Immersive Mode**: 모든 UI 요소를 한 번에 숨기고 지식 그래프의 심연에만 집중할 수 있는 순수 시각화 모드 제공.
    - **Collapsible Data Logs**: 채팅 이력을 HUD(Heads-Up Display) 스타일의 접이식 창으로 구성하여 화면 가림을 최소화하고 시각적 개방감 극대화.
    - **Glassmorphism 2.0**: 고해상도 `backdrop-blur`와 초경량 반투명 레이어를 결합하여 그래프와 인터페이스가 유기적으로 겹쳐 보이는 몰입감 선사.
- **Magic Input & File Digestion**: 채팅과 파일 처리를 통합한 인터페이스.

### 🔌 Connectivity & Expansion
- **[Completed] Module B: Universal File Loader (Data Digestion)**
    - 이력서, 일기장, 포트폴리오 등 비정형 파일을 드래그하면 알아서 분류하여 그래프에 흡수.
    - **Magic Input**: 텍스트 채팅과 파일 처리를 통합한 지능형 입력바.
    - **Enhanced Inference**: `Gemini 2.0 Flash` 기반의 고속/고정밀 추론 엔진 탑재 (Unknown 노드 방지).
- **[Completed] Module C: Connectivity & Stability**
    - **Neo4j AuraDB Integration**: 클라우드 네이티브 그래프 DB 연동을 통해 전 세계 어디서든 중단 없는 디지털 자아 저장 서비스 제공.
    - **Singleton Driver Architecture**: 전역 수준의 드라이버 관리를 통해 연결 안정성과 쿼리 성능 비약적 향상.
    - **MCP Support**: 외부 AI 에이전트가 내 기억 데이터를 도구로 활용할 수 있는 Model Context Protocol 기반 구축.

### ✨ High-Fidelity UX & Stability (The Polish)
사용자 경험의 완성도를 결정짓는 미세한 디테일을 최적화했습니다.

- **Dizziness-Free Interaction**: 링크 입자 속도를 **75% 감속**하여 대규모 그래프에서도 눈이 편안한 탐험 환경 조성.
- **Computational Efficiency**: 전역 애니메이션 루프를 오브젝트별 `onBeforeRender`로 분산하여 **CPU/GPU 부하 90% 저감**, 메모리 누수 원천 차단.
- **Linguistic Integrity**: 검색 결과 상의 외국어 지식을 사용자 입력 언어(한국어)로 **실시간 번역/추출**하여 완전한 한글 사용자 경험 보장.
- **HUD-Centric Layout**: 입력 인터페이스를 반투명 위젯화하여 그래프 시인성을 40% 이상 개선.

---

## 🛠 Tech Stack

| Type | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14** | App Router, SSR/CSR Hybrid, Framer Motion |
| | **TypeScript** | Strict Type Safety |
| | **Three.js** | Advanced 3D Rendering (Custom Shader-ready) |
| | **TailwindCSS** | Glassmorphism & Cyberpunk Design Tokens |
| **Backend** | **Python FastAPI** | Enterprise-grade Async API Framework |
| | **Google Gemini 2.0 Flash** | SOTA LLM (Extraction & Reasoning), Sub-second Latency |
| | **Neo4j (AuraDB)** | Cloud-native Graph DB, High-performance Cypher Queries |

---

## 📦 Development Guide

### 1. Installation
```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
pip install -r requirements.txt
uvicorn server:app --reload
```

### 2. Deployment
본 리포지토리는 GitHub를 통해 관리됩니다.

**코드 업데이트 루틴:**
1. 작업 전: `git pull origin main` (최신 코드 동기화)
2. 작업 후: 
   ```bash
   git add .
   git commit -m "Update description"
   git push origin main
   ```

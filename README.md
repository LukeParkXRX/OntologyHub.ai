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

- **4-Layer Ontology Schema (ALIVE Model)**
    - **Semantic**: 객관적 사실 (이름, 직업, 관계)
    - **Episodic**: 시공간이 특정된 기억 사건 (`Event` Node)
    - **Psychometric**: 내면의 감정, 가치, 성격 (`Emotion`, `Value` Node)
    - **Kinetic**: 사용자의 의도와 행동 가능성
- **Context-Aware Active Agency**
    - **Genesis Interviewer**: 사용자의 그래프 상태를 실시간 분석하여, 누락된 연결고리(Missing Link)를 묻는 능동형 질문 생성.
- **Active Learning**: 채팅창의 대화를 실시간으로 분석하여 Node & Edge로 변환 및 저장 (`source: 'user'` 태깅).

### 🪞 Frontend (The Mirror)
디지털 자아를 마주하는 몰입형 인터페이스입니다.

- **Immersive 3D Visualization**: WebGL 기반으로 우주를 유영하듯 자신의 내면을 탐험하는 Dark Mode UI.
- **Memory Timeline**: 그래프 내의 시간 정보를 추출하여 과거의 특정 시점으로 "기억의 시간 여행" 기능 제공.
- **Interactive Controls**: 중요도 기반 필터링(Peeling Layers) 및 Universe Reset 기능.

### 🔌 Connectivity & Expansion
### 🔌 Connectivity & Expansion
- **[Completed] Module B: Universal File Loader (Data Digestion)**
    - 이력서, 일기장, 포트폴리오 등 비정형 파일을 드래그하면 알아서 분류하여 그래프에 흡수.
    - **Magic Input**: 텍스트 채팅과 파일 처리를 통합한 지능형 입력바.
    - **Enhanced Inference**: `Gemini 1.5 Pro` 기반의 고정밀 추론 엔진 탑재 (Unknown 노드 방지).
- **[In Progress] Module C: ALIVE MCP Server**
    - **Protocol**: 외부 AI(Claude, GPT)가 내 그래프를 도구로 쓸 수 있게 하는 **MCP(Model Context Protocol)** 지원.
    - **Resource**: `alive://me/profile` (자아 요약).
    - **Tool**: `search_my_memory` (맥락 기반 기억 검색).


---

## 🛠 Tech Stack

| Type | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14** | App Router, SSR/CSR Hybrid |
| | **TypeScript** | Type Safety |
| | **Three.js** | 3D Graph Visualization (`react-force-graph`) |
| | **TailwindCSS** | Utility-first Styling (Dark Mode) |
| **Backend** | **Python FastAPI** | High-performance Async API Server |
| | **Google Gemini Pro** | LLM (Extraction, Inference, Chat) |
| | **Neo4j (AuraDB)** | Graph Database (Cypher Query Language) |

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

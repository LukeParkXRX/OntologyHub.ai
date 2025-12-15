# OntologyHub.ai

**OntologyHub.ai** is a Next.js + FastAPI hybrid application designed to visualize and manage knowledge graphs using Neo4j and AI.
(**OntologyHub.ai**는 Neo4j와 AI를 사용하여 지식 그래프를 시각화하고 관리하도록 설계된 Next.js + FastAPI 하이브리드 애플리케이션입니다.)

## Project Structure (프로젝트 구조)

- **Frontend**: Next.js 16 (React 19), Tailwind CSS, D3-Force Graph
- **Backend**: Python 3.9+, FastAPI, LangChain, Neo4j
- **Database**: Neo4j AuraDB

## Prerequisites (필수 조건)

Before you begin, ensure you have the following installed:
(시작하기 전에 다음 항목들이 설치되어 있는지 확인하세요:)

- **Node.js**: v20 or higher (v20 이상)
- **Python**: v3.9 or higher (Tested on 3.9.6) (v3.9 이상)
- **Neo4j AuraDB**: An active instance (활성화된 Neo4j 인스턴스)

## Installation (설치)

### 1. Frontend Setup (프론트엔드 설정)
Install the Node.js dependencies:
(Node.js 의존성 패키지를 설치합니다:)

```bash
npm install
```

### 2. Backend Setup (백엔드 설정)
Set up the Python virtual environment and install dependencies:
(Python 가상 환경을 설정하고 의존성 패키지를 설치합니다:)

```bash
# Create virtual environment (가상 환경 생성)
python3 -m venv venv

# Activate virtual environment (가상 환경 활성화)
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# .\venv\Scripts\activate

# Install dependencies (의존성 설치)
pip install -r backend/requirements.txt
```

## Configuration (환경 설정: .env)

Create a `.env` file in the root directory (based on `backend/example.env`) and fill in your keys:
(루트 디렉토리에 `.env` 파일을 생성하고 키 값을 입력하세요. `backend/example.env`를 참고하세요.)

```properties
# Neo4j AuraDB Configuration
NEO4J_URI=neo4j+s://<your-instance-id>.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=<your-password>

# AI API Keys
OPENAI_API_KEY=sk-...
TAVILY_API_KEY=tvly-...
```

> **Note**: The backend is configured to start in **Offline Mode** if the database connection fails, allowing you to debug the frontend without a live DB.
> (**참고**: 데이터베이스 연결에 실패할 경우 백엔드는 **오프라인 모드**로 시작되도록 설정되어 있어, DB 없이도 프론트엔드를 디버깅할 수 있습니다.)

## Running the Application (애플리케이션 실행)

To run the full stack locally, you need two terminals.
(로컬에서 전체 스택을 실행하려면 두 개의 터미널이 필요합니다.)

### Terminal 1: Backend (FastAPI)

```bash
# Ensure venv is activated (가상 환경이 활성화되었는지 확인하세요)
source venv/bin/activate

# Run the server on port 8000 (8000번 포트에서 서버 실행)
uvicorn api.index:app --reload --port 8000
```

### Terminal 2: Frontend (Next.js)

```bash
# Run the development server (개발 서버 실행)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.
(브라우저에서 http://localhost:3000 으로 접속하세요.)

## Deployment (배포)

This project is configured for deployment on **Vercel**.
(이 프로젝트는 **Vercel** 배포에 최적화되어 있습니다.)

1.  Push your code to GitHub. (코드를 GitHub에 푸시합니다.)
2.  Import the project in Vercel. (Vercel에서 프로젝트를 가져옵니다.)
3.  Add the Environment Variables (`NEO4J_URI`, `OPENAI_API_KEY`, etc.) in the Vercel project settings. (Vercel 프로젝트 설정에 환경 변수를 추가합니다.)
4.  Vercel will automatically detect the Next.js frontend and the Python backend (via `api/index.py`). (Vercel이 Next.js 프론트엔드와 Python 백엔드를 자동으로 감지합니다.)

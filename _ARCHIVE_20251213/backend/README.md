# OntologyHub.AI ALIVE Backend

ALIVE 엔진 - 뉴로-심볼릭 하이브리드 AI 백엔드

## 기술 스택

- **Python 3.10+** with FastAPI (Async)
- **Memgraph** - 그래프 데이터베이스 (관계, 자아, 불변의 사실)
- **Weaviate** - 벡터 데이터베이스 (에피소드 기억, 유사도 검색)
- **Redis** - 캐시 및 실시간 스트리밍 (Pub/Sub)

## 설치 및 실행

### 1. 가상환경 설정

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. 인프라 실행 (Docker)

```bash
docker-compose up -d
```

### 3. 개발 서버 실행

```bash
uvicorn app.main:app --reload --port 8000
```

## 프로젝트 구조

```
backend/
├── app/
│   ├── main.py              # FastAPI 진입점
│   ├── config.py            # 환경 설정
│   ├── models/              # Pydantic 데이터 모델
│   │   ├── graph.py         # Memgraph 노드/관계 모델
│   │   └── vector.py        # Weaviate 스키마
│   ├── db/                  # 데이터베이스 연결
│   │   ├── memgraph.py      # Memgraph 클라이언트
│   │   ├── weaviate.py      # Weaviate 클라이언트
│   │   └── redis.py         # Redis 클라이언트
│   ├── services/            # 비즈니스 로직
│   │   ├── etl/             # 자동 학습 파이프라인
│   │   ├── orchestrator/    # Hybrid Orchestrator
│   │   ├── gatekeeper/      # Ontology Gatekeeper
│   │   └── motion/          # Intent-to-Motion
│   └── api/                 # API 라우트
│       ├── routes/
│       └── websocket.py
├── tests/                   # 테스트
├── requirements.txt
├── docker-compose.yml
└── README.md
```

## API 문서

서버 실행 후 http://localhost:8000/docs 에서 Swagger UI 확인

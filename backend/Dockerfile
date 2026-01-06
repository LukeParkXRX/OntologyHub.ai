# 1. Python 가벼운 버전 사용
FROM python:3.9-slim

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. 시스템 의존성 설치 (필요시 git, gcc 등 추가)
# build-essential: gcc 등 컴파일러 포함 (일부 파이썬 패키지 빌드용)
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 4. 의존성 파일 복사 및 설치
# requirements.txt가 변경되지 않으면 이 레이어는 캐시됨
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. 소스 코드 복사
COPY . .

# 6. 포트 노출 (Render는 내부적으로 이 포트를 감지합니다)
EXPOSE 8000

# 7. 실행 명령 (production 레벨 실행, reload 옵션 제외)
# server:app 은 server.py 파일의 app 객체를 의미합니다.
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]

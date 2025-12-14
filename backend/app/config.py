from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    # Neo4j Settings
    NEO4J_URI: str = Field(..., description="URI for Neo4j AuraDB")
    NEO4J_USERNAME: str = Field(..., description="Username for Neo4j AuraDB")
    NEO4J_PASSWORD: str = Field(..., description="Password for Neo4j AuraDB")

    # AI API Keys
    OPENAI_API_KEY: str = Field(..., description="OpenAI API Key")
    TAVILY_API_KEY: str | None = Field(None, description="Tavily API Key (Optional)")

    # App Settings
    PROJECT_NAME: str = "OntologyHub.AI"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

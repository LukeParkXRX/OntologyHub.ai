from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional

class Settings(BaseSettings):
    # Neo4j Settings
    NEO4J_URI: Optional[str] = Field(None, description="URI for Neo4j AuraDB")
    NEO4J_USERNAME: Optional[str] = Field(None, description="Username for Neo4j AuraDB")
    NEO4J_PASSWORD: Optional[str] = Field(None, description="Password for Neo4j AuraDB")

    # AI API Keys
    OPENAI_API_KEY: Optional[str] = Field(None, description="OpenAI API Key")
    TAVILY_API_KEY: Optional[str] = Field(None, description="Tavily API Key (Optional)")

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

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Supabase
    supabase_url: str = ""
    supabase_service_role_key: str = ""

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Server
    port: int = 5000
    host: str = "0.0.0.0"
    cors_origins: str = "http://localhost:3000"

    # Model
    default_model: str = "indobert"
    indobert_model_name: str = "mdhugol/indonesia-bert-sentiment-classification"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

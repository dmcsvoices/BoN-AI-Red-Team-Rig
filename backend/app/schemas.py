from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Base schemas
class SessionBase(BaseModel):
    name: str
    target_model: str
    seed_prompt: str
    prompt_generation_llm: str
    evaluation_llm: str
    status: Optional[str] = "created"

class SessionCreate(SessionBase):
    pass

class SessionUpdate(BaseModel):
    name: Optional[str] = None
    target_model: Optional[str] = None
    seed_prompt: Optional[str] = None
    prompt_generation_llm: Optional[str] = None
    evaluation_llm: Optional[str] = None
    status: Optional[str] = None

class PromptVariantBase(BaseModel):
    text: str
    attack_technique: Optional[str] = None
    approved: Optional[bool] = None

class PromptVariantCreate(PromptVariantBase):
    session_id: int

class ResponseBase(BaseModel):
    test_prompt: Optional[str] = None
    target_response: Optional[str] = None
    evaluation_result: Optional[str] = None
    is_dangerous: Optional[bool] = None
    human_feedback: Optional[str] = None

class ResponseCreate(ResponseBase):
    session_id: int
    prompt_variant_id: Optional[int] = None

# Response schemas (what API returns)
class PromptVariant(PromptVariantBase):
    id: int
    session_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Response(ResponseBase):
    id: int
    session_id: int
    prompt_variant_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

class Session(SessionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    prompt_variants: List[PromptVariant] = []
    responses: List[Response] = []

    class Config:
        from_attributes = True

class SessionSummary(BaseModel):
    id: int
    name: str
    target_model: str
    seed_prompt: str
    prompt_generation_llm: str
    evaluation_llm: str
    status: str
    created_at: datetime
    prompt_count: int
    response_count: int

    class Config:
        from_attributes = True
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from database import db

router = APIRouter(prefix="/api/ai", tags=["ai"])

class QuizAnswers(BaseModel):
    hair_type: Optional[List[str]] = None
    skin_tone: Optional[str] = None
    concern: Optional[str] = None
    occasion: Optional[str] = None
    budget: Optional[int] = None

class AIMatchResult(BaseModel):
    salon_id: str
    match_score: int
    reasoning: str

@router.post("/match", response_model=List[AIMatchResult])
async def ai_match(answers: QuizAnswers):
    # Retrieve all active salons to do matching
    salons_cursor = db.salons.find({"is_active": True}).limit(10)
    salons = await salons_cursor.to_list(length=10)
    
    if not salons:
        return []
    
    # Dummy mock response since we don't have Cohere / Claude keys configured right now
    # In a real scenario we would:
    # 1. Embed answers using Cohere
    # 2. Compare against salon embeddings
    # 3. Call Claude for reasoning
    
    results = []
    for i, salon in enumerate(salons):
        score = 95 - (i * 5)
        results.append(
            AIMatchResult(
                salon_id=str(salon["_id"]),
                match_score=score,
                reasoning=f"This salon matches your '{answers.occasion or 'everyday'}' needs perfectly with expert stylists for your profile."
            )
        )
        
    return results

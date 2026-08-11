# Ref: RF-011, RF-012, B-009
from pydantic import BaseModel

class LikeToggleResponse(BaseModel):
    liked: bool
    likes_count: int

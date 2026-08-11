# Ref: RF-015, RF-016, B-015
from pydantic import BaseModel

class DashboardStatsResponse(BaseModel):
    users: int
    posts: int
    likes: int
    comments: int
    my_posts: int
    my_likes_received: int

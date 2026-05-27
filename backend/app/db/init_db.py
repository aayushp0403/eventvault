from app.db.database import Base, engine
from app.models import user, event, album, media, social  # noqa: registers all models

def init():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init()
    print("✅ All tables created.")
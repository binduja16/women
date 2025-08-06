from database import Base, engine
from models import UserData

Base.metadata.create_all(bind=engine)

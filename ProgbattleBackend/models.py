from sqlalchemy import Boolean, Column, String, DateTime, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from uuid import uuid4


Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    team_id = Column(String, ForeignKey("teams.id"), nullable=True)
    registered_at = Column(DateTime, default=datetime.utcnow)
    is_verified = Column(Boolean, default=False)

    team = relationship("Team", back_populates="members")
    submissions = relationship("Submission", back_populates="user")

    def __repr__(self):
        return f"<User {self.email}>"


class Team(Base):
    __tablename__ = "teams"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    name = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    max_size = Column(Integer, default=5)
    members = relationship("User", back_populates="team")
    submissions = relationship("Submission", back_populates="team", foreign_keys="[Submission.team_id]")
    best_submission_id = Column(String, ForeignKey("submissions.id"), nullable=True)
    best_score = Column(Float, default=0.0)
    join_password = Column(String, nullable=True)  # Optional password for joining the team
    def __repr__(self):
        return f"<Team {self.name}>"
    

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    team_id = Column(String, ForeignKey("teams.id"), nullable=False)
    bot_name = Column(String, nullable=False)
    score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="pending")

    user = relationship("User", back_populates="submissions")
    team = relationship("Team", back_populates="submissions", foreign_keys="[Submission.team_id]")

    def __repr__(self):
        return f"<Submission {self.id} by {self.user_id} - {self.bot_name} (score={self.score}, W:{self.wins} L:{self.losses})>"


class SystemBot(Base):
    __tablename__ = "system_bots"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    name = Column(String, unique=True, nullable=False)
    file_path = Column(String, nullable=False)
    weight = Column(Float, default=1.0)  # score importance
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<SystemBot {self.name}>"


class MatchResult(Base):
    __tablename__ = "match_results"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    submission_id = Column(String, ForeignKey("submissions.id"))
    system_bot_id = Column(String, ForeignKey("system_bots.id"))
    match_number = Column(Integer)
    user_score = Column(Float)
    system_score = Column(Float)
    log_path = Column(String)  # individual match replay log
    
    submission = relationship("Submission")
    system_bot = relationship("SystemBot")

    def __repr__(self):
        return f"<MatchResult S:{self.submission_id} vs B:{self.system_bot_id} -> {self.score}>"

class Round2Match(Base):
    __tablename__ = "round2matches"

    id = Column(String, primary_key=True, index=True)

    # Teams and submissions
    team1_id = Column(String, ForeignKey("teams.id"), nullable=False)
    team2_id = Column(String, ForeignKey("teams.id"), nullable=False)
    team1_submission_id = Column(String, ForeignKey("submissions.id"), nullable=False)
    team2_submission_id = Column(String, ForeignKey("submissions.id"), nullable=False)

    # Scores
    team1_score = Column(Float, nullable=True)
    team2_score = Column(Float, nullable=True)

    # Match metadata
    winner_id = Column(String, ForeignKey("teams.id"), nullable=True)
    status = Column(String, default="pending")  # "pending", "evaluated", "failed"
    group_id = Column(Integer, nullable=True)  # Only used in group stage
    log_path = Column(String, nullable=True)

    # Optional relationships for convenience
    team1 = relationship("Team", foreign_keys=[team1_id])
    team2 = relationship("Team", foreign_keys=[team2_id])
    team1_submission = relationship("Submission", foreign_keys=[team1_submission_id])
    team2_submission = relationship("Submission", foreign_keys=[team2_submission_id])
    winner = relationship("Team", foreign_keys=[winner_id])
    stage = Column(String, nullable=False, default="group")
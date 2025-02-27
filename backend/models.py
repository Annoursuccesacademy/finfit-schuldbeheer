from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    address = Column(String)
    postal_code = Column(String)
    city = Column(String)

    debts = relationship("Debt", back_populates="client")

class Debt(Base):
    __tablename__ = "debts"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    creditor = Column(String, index=True)
    amount = Column(Float)
    interest_rate = Column(Float)
    start_date = Column(Date)
    end_date = Column(Date)
    payment_frequency = Column(String)  # monthly, weekly, etc.
    notes = Column(Text, nullable=True)

    client = relationship("Client", back_populates="debts")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    debt_id = Column(Integer, ForeignKey("debts.id"))
    amount = Column(Float)
    date = Column(Date)
    status = Column(String)  # pending, completed, failed
    
    debt = relationship("Debt")

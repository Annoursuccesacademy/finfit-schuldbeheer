from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class DebtBase(BaseModel):
    creditor: str
    amount: float
    interest_rate: float
    start_date: date
    end_date: date
    payment_frequency: str
    notes: Optional[str] = None

class DebtCreate(DebtBase):
    client_id: int

class Debt(DebtBase):
    id: int
    client_id: int

    class Config:
        orm_mode = True

class ClientBase(BaseModel):
    name: str
    email: str
    phone: str
    address: str
    postal_code: str
    city: str

class ClientCreate(ClientBase):
    pass

class Client(ClientBase):
    id: int
    debts: List[Debt] = []

    class Config:
        orm_mode = True

class PaymentBase(BaseModel):
    amount: float
    date: date
    status: str

class PaymentCreate(PaymentBase):
    debt_id: int

class Payment(PaymentBase):
    id: int
    debt_id: int

    class Config:
        orm_mode = True

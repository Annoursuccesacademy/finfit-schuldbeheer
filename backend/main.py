from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Optional, Any
from datetime import datetime, date
from pydantic import BaseModel, Field

app = FastAPI(title="FinFit Schuldbeheer Assistent")

# CORS middleware configuratie
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In productie dit aanpassen naar specifieke origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class BudgetItem(BaseModel):
    category: str  # bijvoorbeeld: 'inkomen', 'vaste_lasten', 'boodschappen'
    description: str
    amount: float
    frequency: str  # 'monthly', 'weekly', 'yearly'

class Budget(BaseModel):
    income_items: List[BudgetItem] = []
    expense_items: List[BudgetItem] = []

class ContactEntry(BaseModel):
    date: date = Field(default_factory=lambda: date.today())
    contact_type: str  # 'telefonisch', 'email', 'persoonlijk', etc.
    notes: str
    outcome: Optional[str] = None
    follow_up_date: Optional[date] = None

class Payment(BaseModel):
    payment_date: date = Field(default_factory=lambda: date.today())
    amount: float
    payment_method: str  # 'bank', 'contant', 'automatisch', etc.
    is_confirmed: bool = False
    notes: Optional[str] = None

class ClientBase(BaseModel):
    name: str
    email: str
    phone: str
    address: Optional[str] = None
    postal_code: Optional[str] = None
    city: Optional[str] = None
    budget: Optional[Budget] = None
    notes: Optional[str] = None
    last_contact_date: Optional[date] = None

class ClientCreate(ClientBase):
    pass

class Client(ClientBase):
    id: int

class DebtBase(BaseModel):
    client_id: int
    creditor: str
    amount: float
    interest_rate: Optional[float] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    payment_frequency: Optional[str] = None  # 'monthly', 'weekly', 'yearly', 'one-time'
    notes: Optional[str] = None
    status: str = "active"  # 'active', 'paid', 'negotiating', 'defaulted', etc.
    payment_history: List[Payment] = []
    contact_history: List[ContactEntry] = []
    next_payment_date: Optional[date] = None
    payment_arrangement: Optional[str] = None

class DebtCreate(DebtBase):
    payment_history: List[Payment] = []
    contact_history: List[ContactEntry] = []

class Debt(DebtBase):
    id: int

# Tijdelijke in-memory storage
clients = [
    {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "0612345678",
        "address": "Hoofdstraat 1",
        "postal_code": "1234 AB",
        "city": "Amsterdam",
        "notes": "Eerste intake gesprek gehad op 15 januari 2025.",
        "last_contact_date": date(2025, 1, 15)
    }
]

debts = [
    {
        "id": 1,
        "client_id": 1,
        "creditor": "Bank XYZ",
        "amount": 5000.00,
        "interest_rate": 4.5,
        "start_date": date(2025, 1, 1),
        "end_date": date(2026, 1, 1),
        "payment_frequency": "monthly",
        "notes": "Persoonlijke lening",
        "status": "active",
        "payment_history": [
            {
                "payment_date": date(2025, 1, 15),
                "amount": 150.00,
                "payment_method": "bank",
                "is_confirmed": True,
                "notes": "Eerste termijn betaald"
            }
        ],
        "contact_history": [
            {
                "date": date(2025, 1, 10),
                "contact_type": "telefonisch",
                "notes": "Gebeld over betalingsregeling",
                "outcome": "Betalingsregeling geaccepteerd",
                "follow_up_date": date(2025, 2, 10)
            }
        ],
        "next_payment_date": date(2025, 2, 15),
        "payment_arrangement": "€150 per maand gedurende 36 maanden"
    }
]

# Hulpfuncties
def find_client(client_id: int) -> Optional[dict]:
    return next((client for client in clients if client["id"] == client_id), None)

def find_debt(debt_id: int) -> Optional[dict]:
    return next((debt for debt in debts if debt["id"] == debt_id), None)

@app.get("/")
def read_root():
    return {"message": "Welkom bij FinFit Schuldbeheer Assistent API"}

@app.get("/clients/", response_model=List[Client])
def read_clients():
    return clients

@app.post("/clients/", response_model=Client)
def create_client(client: ClientCreate):
    try:
        new_client = client.dict()
        new_client["id"] = len(clients) + 1
        
        # Zorg ervoor dat de budget items correct worden geconverteerd
        if new_client.get('budget'):
            budget = new_client['budget']
            if isinstance(budget, dict):
                if 'income_items' in budget:
                    budget['income_items'] = [
                        item if isinstance(item, dict) else item.dict()
                        for item in budget['income_items']
                    ]
                if 'expense_items' in budget:
                    budget['expense_items'] = [
                        item if isinstance(item, dict) else item.dict()
                        for item in budget['expense_items']
                    ]
        
        clients.append(new_client)
        return new_client
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/clients/{client_id}", response_model=Client)
def read_client(client_id: int):
    client = find_client(client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client niet gevonden")
    return client

@app.put("/clients/{client_id}", response_model=Client)
def update_client(client_id: int, client: ClientCreate):
    existing_client = find_client(client_id)
    if not existing_client:
        raise HTTPException(status_code=404, detail="Client niet gevonden")
    
    update_data = client.dict(exclude_unset=True)
    for key, value in update_data.items():
        existing_client[key] = value
    
    return existing_client

@app.delete("/clients/{client_id}")
def delete_client(client_id: int):
    client = find_client(client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client niet gevonden")
    
    clients.remove(client)
    return {"message": "Client verwijderd"}

@app.get("/clients/{client_id}/debts/", response_model=List[Debt])
def read_client_debts(client_id: int):
    if not find_client(client_id):
        raise HTTPException(status_code=404, detail="Client niet gevonden")
    return [debt for debt in debts if debt["client_id"] == client_id]

@app.post("/debts/", response_model=Debt)
def create_debt(debt: DebtCreate):
    if not find_client(debt.client_id):
        raise HTTPException(status_code=404, detail="Client niet gevonden")
    
    new_debt = debt.dict()
    new_debt["id"] = len(debts) + 1
    debts.append(new_debt)
    return new_debt

@app.get("/debts/{debt_id}", response_model=Debt)
def read_debt(debt_id: int):
    debt = find_debt(debt_id)
    if not debt:
        raise HTTPException(status_code=404, detail="Schuld niet gevonden")
    return debt

@app.put("/debts/{debt_id}", response_model=Debt)
def update_debt(debt_id: int, debt: DebtCreate):
    existing_debt = find_debt(debt_id)
    if not existing_debt:
        raise HTTPException(status_code=404, detail="Schuld niet gevonden")
    
    if not find_client(debt.client_id):
        raise HTTPException(status_code=404, detail="Client niet gevonden")
    
    update_data = debt.dict(exclude_unset=True)
    for key, value in update_data.items():
        existing_debt[key] = value
    
    return existing_debt

@app.delete("/debts/{debt_id}")
def delete_debt(debt_id: int):
    debt = find_debt(debt_id)
    if not debt:
        raise HTTPException(status_code=404, detail="Schuld niet gevonden")
    
    debts.remove(debt)
    return {"message": "Schuld verwijderd"}

@app.get("/statistics/")
def get_statistics():
    total_clients = len(clients)
    total_debts = len(debts)
    total_debt_amount = sum(debt["amount"] for debt in debts)
    average_debt_amount = total_debt_amount / total_debts if total_debts > 0 else 0
    
    # Status verdeling
    status_breakdown = {}
    for debt in debts:
        status = debt.get("status", "active")
        if status in status_breakdown:
            status_breakdown[status] += 1
        else:
            status_breakdown[status] = 1
    
    # Recente betalingen
    recent_payments = []
    for debt in debts:
        for payment in debt.get("payment_history", []):
            if isinstance(payment, dict):  # Voor in-memory storage
                payment_data = {
                    "debt_id": debt["id"],
                    "client_id": debt["client_id"],
                    "client_name": find_client(debt["client_id"])["name"],
                    "creditor": debt["creditor"],
                    "amount": payment["amount"],
                    "date": payment["payment_date"],
                    "is_confirmed": payment["is_confirmed"]
                }
                recent_payments.append(payment_data)
    
    recent_payments = sorted(recent_payments, key=lambda x: x["date"], reverse=True)[:5]
    
    return {
        "total_clients": total_clients,
        "total_debts": total_debts,
        "total_debt_amount": total_debt_amount,
        "average_debt_amount": average_debt_amount,
        "status_breakdown": status_breakdown,
        "recent_payments": recent_payments
    }

# Nieuwe endpoints voor betalingen bijhouden
@app.post("/debts/{debt_id}/payments/")
def add_payment(debt_id: int, payment: Payment):
    debt = find_debt(debt_id)
    if not debt:
        raise HTTPException(status_code=404, detail="Schuld niet gevonden")
        
    if "payment_history" not in debt:
        debt["payment_history"] = []
        
    payment_dict = payment.dict()
    debt["payment_history"].append(payment_dict)
    
    return {"message": "Betaling toegevoegd", "payment": payment_dict}

@app.get("/debts/{debt_id}/payments/")
def get_payments(debt_id: int):
    debt = find_debt(debt_id)
    if not debt:
        raise HTTPException(status_code=404, detail="Schuld niet gevonden")
        
    return debt.get("payment_history", [])

@app.delete("/debts/{debt_id}/payments/{payment_index}")
def delete_payment(debt_id: int, payment_index: int):
    debt = find_debt(debt_id)
    if not debt:
        raise HTTPException(status_code=404, detail="Schuld niet gevonden")
        
    payment_history = debt.get("payment_history", [])
    if payment_index < 0 or payment_index >= len(payment_history):
        raise HTTPException(status_code=404, detail="Betaling niet gevonden")
        
    deleted_payment = payment_history.pop(payment_index)
    
    return {"message": "Betaling verwijderd", "payment": deleted_payment}

# Endpoints voor contactgeschiedenis
@app.post("/debts/{debt_id}/contacts/")
def add_contact(debt_id: int, contact: ContactEntry):
    debt = find_debt(debt_id)
    if not debt:
        raise HTTPException(status_code=404, detail="Schuld niet gevonden")
        
    if "contact_history" not in debt:
        debt["contact_history"] = []
        
    contact_dict = contact.dict()
    debt["contact_history"].append(contact_dict)
    
    # Update client's last contact date
    client = find_client(debt["client_id"])
    if client:
        client["last_contact_date"] = contact_dict["date"]
    
    return {"message": "Contact toegevoegd", "contact": contact_dict}

@app.get("/debts/{debt_id}/contacts/")
def get_contacts(debt_id: int):
    debt = find_debt(debt_id)
    if not debt:
        raise HTTPException(status_code=404, detail="Schuld niet gevonden")
        
    return debt.get("contact_history", [])

@app.delete("/debts/{debt_id}/contacts/{contact_index}")
def delete_contact(debt_id: int, contact_index: int):
    debt = find_debt(debt_id)
    if not debt:
        raise HTTPException(status_code=404, detail="Schuld niet gevonden")
        
    contact_history = debt.get("contact_history", [])
    if contact_index < 0 or contact_index >= len(contact_history):
        raise HTTPException(status_code=404, detail="Contact niet gevonden")
        
    deleted_contact = contact_history.pop(contact_index)
    
    return {"message": "Contact verwijderd", "contact": deleted_contact}

# Update debt status
@app.put("/debts/{debt_id}/status/")
def update_debt_status(debt_id: int, status: str):
    debt = find_debt(debt_id)
    if not debt:
        raise HTTPException(status_code=404, detail="Schuld niet gevonden")
        
    valid_statuses = ["active", "paid", "negotiating", "defaulted", "dispute", "legal"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Ongeldige status. Geldige waarden zijn: {', '.join(valid_statuses)}")
        
    debt["status"] = status
    
    return {"message": f"Status bijgewerkt naar {status}", "debt_id": debt_id}

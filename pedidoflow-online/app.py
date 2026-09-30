import os, re, io, json, hmac, base64, hashlib, secrets
from datetime import datetime, date, timedelta
from pathlib import Path

from fastapi import FastAPI, Request, Response, Depends, HTTPException, UploadFile, File
from fastapi.responses import HTMLResponse, StreamingResponse
from sqlalchemy import create_engine, Column, Integer, String, Date, DateTime, Float, Text, ForeignKey, Boolean, func
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Session
from openpyxl import load_workbook, Workbook

APP_SECRET=os.getenv("APP_SECRET") or secrets.token_urlsafe(48)
DATABASE_URL=os.getenv("DATABASE_URL","sqlite:///./pedidoflow.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL="postgresql+psycopg://"+DATABASE_URL[len("postgres://"):]
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL="postgresql+psycopg://"+DATABASE_URL[len("postgresql://"):]

engine=create_engine(DATABASE_URL,connect_args={"check_same_thread":False} if DATABASE_URL.startswith("sqlite") else {},pool_pre_ping=True)
SessionLocal=sessionmaker(bind=engine,autoflush=False,autocommit=False)
Base=declarative_base()

class Organization(Base):
    __tablename__="organizations"
    id=Column(Integer,primary_key=True)
    name=Column(String(160),nullable=False)

class User(Base):
    __tablename__="users"
    id=Column(Integer,primary_key=True)
    organization_id=Column(Integer,ForeignKey("organizations.id"),nullable=False)
    name=Column(String(120),nullable=False)
    email=Column(String(180),nullable=False)
    password_hash=Column(String(300),nullable=False)
    role=Column(String(20),default="buyer")
    active=Column(Boolean,default=True)

class Supplier(Base):
    __tablename__="suppliers"
    id=Column(Integer,primary_key=True)
    organization_id=Column(Integer,ForeignKey("organizations.id"),nullable=False)
    legal_name=Column(String(240),nullable=False)
    trade_name=Column(String(180))
    tax_id=Column(String(40))
    phone=Column(String(60))
    email=Column(String(180))

class PurchaseOrder(Base):
    __tablename__="purchase_orders"
    id=Column(Integer,primary_key=True)
    organization_id=Column(Integer,ForeignKey("organizations.id"),nullable=False)
    number=Column(String(30),nullable=False)
    supplier_id=Column(Integer,ForeignKey("suppliers.id"))
    buyer_id=Column(Integer,ForeignKey("users.id"))
    buyer_name=Column(String(120))
    issued_at=Column(Date)
    system_due_date=Column(Date)
    sent_at=Column(Date)
    priority=Column(String(20),default="Normal")
    entry_notes=Column(Text)
    supplier_due_date=Column(Date)
    supplier_status=Column(String(100))
    next_follow_up=Column(Date)
    tracking_notes=Column(Text)
    updated_at=Column(DateTime,default=datetime.utcnow,onupdate=datetime.utcnow)
    supplier=relationship("Supplier")
    items=relationship("OrderItem",cascade="all, delete-orphan",back_populates="order")

class OrderItem(Base):
    __tablename__="order_items"
    id=Column(Integer,primary_key=True)
    order_id=Column(Integer,ForeignKey("purchase_orders.id"),nullable=False)
    erp_code=Column(String(60))
    description=Column(String(500),nullable=False)
    unit=Column(String(20))
    quantity=Column(Float,default=0)
    quantity_delivered=Column(Float,default=0)
    total_value=Column(Float,default=0)
    order=relationship("PurchaseOrder",back_populates="items")

Base.metadata.create_all(engine)
app=FastAPI(title="PedidoFlow Online")

def dbdep():
    db=SessionLocal()
    try: yield db
    finally: db.close()

def hpw(p):
    salt=secrets.token_bytes(16)
    dk=hashlib.pbkdf2_hmac("sha256",p.encode(),salt,180000)
    return "pbkdf2$"+base64.b64encode(salt).decode()+"$"+base64.b64encode(dk).decode()

def vpw(p,s):
    try:
        _,a,b=s.split("$",2)
        salt=base64.b64decode(a); expected=base64.b64decode(b)
        got=hashlib.pbkdf2_hmac("sha256",p.encode(),salt,180000)
        return hmac.compare_digest(got,expected)
    except: return False

def token(uid,oid):
    body=base64.urlsafe_b64encode(json.dumps({"uid":uid,"oid":oid,"exp":int((datetime.utcnow()+timedelta(days=7)).timestamp())},separators=(",",":")).encode()).decode().rstrip("=")
    sig=hmac.new(APP_SECRET.encode(),body.encode(),hashlib.sha256).hexdigest()
    return body+"."+sig

def untoken(t):
    try:
        body,sig=t.split(".",1)
        if not hmac.compare_digest(sig,hmac.new(APP_SECRET.encode(),body.encode(),hashlib.sha256).hexdigest()): return None
        p=json.loads(base64.urlsafe_b64decode(body+"="*(-len(body)%4)))
        if p["exp"]<int(datetime.utcnow().timestamp()): return None
        return p
    except: return None

def current(req:Request,db:Session=Depends(dbdep)):
    p=untoken(req.cookies.get("session",""))
    if not p: raise HTTPException(401,"Faça login")
    u=db.query(User).filter(User.id==p["uid"],User.organization_id==p["oid"],User.active==True).first()
    if not u: raise HTTPException(401,"Sessão inválida")
    return u

def admin(u=Depends(current)):
    if u.role!="admin": raise HTTPException(403,"Acesso administrativo")
    return u

def dt(v):
    if not v:return None
    if isinstance(v,date):return v
    s=str(v).strip()
    for f in ("%d/%m/%Y","%Y-%m-%d","%d/%m/%y"):
        try:return datetime.strptime(s[:10],f).date()
        except: pass
    return None

def num(v):
    if v in (None,""):return 0.0
    if isinstance(v,(int,float)):return float(v)
    s=str(v).strip().replace(".","").replace(",",".")
    try:return float(s)
    except:return 0.0

def norm(s):
    return re.sub(r"\s+"," ",str(s or "").strip())

def order_json(o):
    q=sum(i.quantity or 0 for i in o.items); d=sum(i.quantity_delivered or 0 for i in o.items)
    pct=round((d/q*100),1) if q else 0
    today=date.today(); due=o.supplier_due_date or o.system_due_date
    if q and d>=q: situation="Concluído"
    elif not o.buyer_name: situation="Pendente comprador"
    elif not o.sent_at: situation="Registrar envio"
    elif o.supplier_due_date and o.supplier_due_date<today: situation="Atrasado"
    elif d>0 and d<q: situation="Entrega parcial"
    elif due and due<=today+timedelta(days=3): situation="Prazo próximo"
    else: situation="Em acompanhamento"
    return {"id":o.id,"number":o.number,"buyer_name":o.buyer_name,"sent_at":o.sent_at.isoformat() if o.sent_at else None,
      "priority":o.priority or "Normal","entry_notes":o.entry_notes or "","system_due_date":o.system_due_date.isoformat() if o.system_due_date else None,
      "supplier_due_date":o.supplier_due_date.isoformat() if o.supplier_due_date else None,"supplier_status":o.supplier_status or "",
      "next_follow_up":o.next_follow_up.isoformat() if o.next_follow_up else None,"tracking_notes":o.tracking_notes or "",
      "quantity":q,"delivered":d,"percent":pct,"situation":situation,
      "supplier":{"name":(o.supplier.trade_name or o.supplier.legal_name) if o.supplier else "","legal_name":o.supplier.legal_name if o.supplier else "",
                  "phone":o.supplier.phone if o.supplier else "","email":o.supplier.email if o.supplier else ""},
      "items":[{"code":i.erp_code,"description":i.description,"unit":i.unit,"quantity":i.quantity,"delivered":i.quantity_delivered} for i in o.items]}

@app.get("/healthz")
def health(): return {"ok":True,"service":"PedidoFlow Online","database":"postgres" if DATABASE_URL.startswith("postgresql") else "sqlite"}

@app.get("/api/bootstrap")
def bootstrap(req:Request,db:Session=Depends(dbdep)):
    initialized=db.query(User).count()>0
    p=untoken(req.cookies.get("session",""))
    user=None
    if p:
        u=db.query(User).filter(User.id==p["uid"]).first()
        if u:user={"name":u.name,"email":u.email,"role":u.role}
    return {"initialized":initialized,"user":user}

@app.post("/api/setup")
async def setup(data:dict,res:Response,db:Session=Depends(dbdep)):
    if db.query(User).count(): raise HTTPException(400,"Sistema já configurado")
    company=norm(data.get("company")); name=norm(data.get("name")); email=norm(data.get("email")).lower(); password=data.get("password") or ""
    if not company or not name or "@" not in email or len(password)<6: raise HTTPException(400,"Preencha empresa, nome, e-mail e senha")
    org=Organization(name=company);db.add(org);db.flush()
    u=User(organization_id=org.id,name=name,email=email,password_hash=hpw(password),role="admin");db.add(u);db.commit();db.refresh(u)
    res.set_cookie("session",token(u.id,org.id),httponly=True,samesite="lax",secure=True,max_age=604800)
    return {"ok":True}

@app.post("/api/login")
async def login(data:dict,res:Response,db:Session=Depends(dbdep)):
    email=norm(data.get("email")).lower(); password=data.get("password") or ""
    u=db.query(User).filter(func.lower(User.email)==email,User.active==True).first()
    if not u or not vpw(password,u.password_hash): raise HTTPException(401,"E-mail ou senha inválidos")
    res.set_cookie("session",token(u.id,u.organization_id),httponly=True,samesite="lax",secure=True,max_age=604800)
    return {"ok":True,"role":u.role}

@app.post("/api/logout")
def logout(res:Response):
    res.delete_cookie("session");return {"ok":True}

@app.get("/api/users")
def users(u=Depends(admin),db:Session=Depends(dbdep)):
    return [{"id":x.id,"name":x.name,"email":x.email,"role":x.role} for x in db.query(User).filter(User.organization_id==u.organization_id).all()]

@app.post("/api/users")
async def create_user(data:dict,u=Depends(admin),db:Session=Depends(dbdep)):
    name=norm(data.get("name"));email=norm(data.get("email")).lower();password=data.get("password") or "";role=data.get("role","buyer")
    if not name or "@" not in email or len(password)<6:raise HTTPException(400,"Dados inválidos")
    if db.query(User).filter(User.organization_id==u.organization_id,func.lower(User.email)==email).first():raise HTTPException(400,"E-mail já cadastrado")
    x=User(organization_id=u.organization_id,name=name,email=email,password_hash=hpw(password),role=role);db.add(x);db.commit()
    return {"ok":True}

@app.get("/api/orders")
def orders(search:str="",u=Depends(current),db:Session=Depends(dbdep)):
    q=db.query(PurchaseOrder).filter(PurchaseOrder.organization_id==u.organization_id)
    if u.role=="buyer": q=q.filter((PurchaseOrder.buyer_id==u.id)|(PurchaseOrder.buyer_id==None))
    data=q.order_by(PurchaseOrder.number.desc()).all()
    s=search.lower().strip()
    if s:data=[o for o in data if s in o.number.lower() or (o.supplier and s in (o.supplier.legal_name or "").lower())]
    return [order_json(o) for o in data[:500]]

@app.get("/api/orders/{number}")
def one(number:str,u=Depends(current),db:Session=Depends(dbdep)):
    o=db.query(PurchaseOrder).filter(PurchaseOrder.organization_id==u.organization_id,PurchaseOrder.number==number.zfill(6)).first()
    if not o:raise HTTPException(404,"Pedido não encontrado")
    if u.role=="buyer" and o.buyer_id not in (None,u.id):raise HTTPException(403,"Pedido atribuído a outro comprador")
    return order_json(o)

@app.post("/api/orders/{number}/buyer-submit")
async def buyer_submit(number:str,data:dict,u=Depends(current),db:Session=Depends(dbdep)):
    if u.role not in ("buyer","admin"):raise HTTPException(403)
    o=db.query(PurchaseOrder).filter(PurchaseOrder.organization_id==u.organization_id,PurchaseOrder.number==number.zfill(6)).first()
    if not o:raise HTTPException(404,"Pedido não encontrado")
    if o.buyer_id not in (None,u.id) and u.role!="admin":raise HTTPException(403,"Pedido atribuído a outro comprador")
    o.buyer_id=u.id;o.buyer_name=u.name;o.sent_at=dt(data.get("sent_at"));o.priority=data.get("priority") or "Normal";o.entry_notes=norm(data.get("entry_notes"))
    db.commit();return order_json(o)

@app.patch("/api/orders/{number}")
async def admin_update(number:str,data:dict,u=Depends(admin),db:Session=Depends(dbdep)):
    o=db.query(PurchaseOrder).filter(PurchaseOrder.organization_id==u.organization_id,PurchaseOrder.number==number.zfill(6)).first()
    if not o:raise HTTPException(404)
    for k in ("supplier_status","tracking_notes"):
        if k in data:setattr(o,k,norm(data[k]))
    for k in ("supplier_due_date","next_follow_up"):
        if k in data:setattr(o,k,dt(data[k]))
    db.commit();return order_json(o)

@app.post("/api/import/orders")
async def import_orders(file:UploadFile=File(...),u=Depends(admin),db:Session=Depends(dbdep)):
    raw=await file.read();wb=load_workbook(io.BytesIO(raw),data_only=True);ws=wb.active
    rows=created=updated=0
    for r in ws.iter_rows(min_row=4,values_only=True):
        pc=norm(r[0])
        if not pc or not re.fullmatch(r"\d{1,6}",pc):continue
        rows+=1;pc=pc.zfill(6);supname=norm(r[9]) or "Fornecedor não informado"
        sup=db.query(Supplier).filter(Supplier.organization_id==u.organization_id,func.lower(Supplier.legal_name)==supname.lower()).first()
        if not sup:sup=Supplier(organization_id=u.organization_id,legal_name=supname);db.add(sup);db.flush()
        o=db.query(PurchaseOrder).filter(PurchaseOrder.organization_id==u.organization_id,PurchaseOrder.number==pc).first()
        if not o:
            o=PurchaseOrder(organization_id=u.organization_id,number=pc,supplier_id=sup.id);db.add(o);db.flush();created+=1
        else: updated+=1;o.supplier_id=sup.id;o.items.clear()
        o.issued_at=dt(r[1]);o.system_due_date=dt(r[10])
        i=OrderItem(order_id=o.id,erp_code=norm(r[2]),description=norm(r[3]) or "Item",unit=norm(r[4]),quantity=num(r[5]),total_value=num(r[7]),quantity_delivered=num(r[11]))
        db.add(i)
    db.commit();return {"ok":True,"rows":rows,"created":created,"updated":updated}

@app.post("/api/import/suppliers")
async def import_suppliers(file:UploadFile=File(...),u=Depends(admin),db:Session=Depends(dbdep)):
    raw=await file.read();wb=load_workbook(io.BytesIO(raw),data_only=True);ws=wb.active
    headers=[norm(c.value).lower() for c in ws[1]]
    def ix(*names):
        for n in names:
            for j,h in enumerate(headers):
                if n in h:return j
        return None
    ni=ix("razão social","razao social","fornecedor");ti=ix("fantasia");ci=ix("cnpj");ddi=ix("ddd");phi=ix("telefone")
    n=0
    for row in ws.iter_rows(min_row=2,values_only=True):
        if ni is None:break
        name=norm(row[ni])
        if not name:continue
        s=db.query(Supplier).filter(Supplier.organization_id==u.organization_id,func.lower(Supplier.legal_name)==name.lower()).first()
        if not s:s=Supplier(organization_id=u.organization_id,legal_name=name);db.add(s)
        if ti is not None:s.trade_name=norm(row[ti])
        if ci is not None:s.tax_id=norm(row[ci])
        phone=(norm(row[ddi]) if ddi is not None else "")+(norm(row[phi]) if phi is not None else "")
        if phone:s.phone=phone
        n+=1
    db.commit();return {"ok":True,"rows":n}

@app.get("/api/export.xlsx")
def export_xlsx(u=Depends(admin),db:Session=Depends(dbdep)):
    wb=Workbook();ws=wb.active;ws.title="ENTRADA_COMPRADORES"
    ws.append(["Nº Pedido","Comprador responsável","Data envio","Prioridade","Observação","Fornecedor","Prazo confirmado","Status fornecedor","Próxima cobrança"])
    for o in db.query(PurchaseOrder).filter(PurchaseOrder.organization_id==u.organization_id).order_by(PurchaseOrder.number).all():
        ws.append([o.number,o.buyer_name,o.sent_at,o.priority,o.entry_notes,(o.supplier.trade_name or o.supplier.legal_name) if o.supplier else "",o.supplier_due_date,o.supplier_status,o.next_follow_up])
    out=io.BytesIO();wb.save(out);out.seek(0)
    return StreamingResponse(out,media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",headers={"Content-Disposition":"attachment; filename=PedidoFlow_Export.xlsx"})

ADMIN_HTML=r"""<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PedidoFlow</title>
<style>body{font:14px Arial;margin:0;background:#f5f7fb;color:#172033}header{padding:14px 20px;background:#fff;border-bottom:1px solid #ddd;display:flex;gap:10px;align-items:center}main{max-width:1200px;margin:auto;padding:18px}.card{background:#fff;border:1px solid #dde3ec;border-radius:10px;padding:14px;margin-bottom:12px}.row{display:flex;gap:8px;flex-wrap:wrap}input,select,textarea,button{padding:9px;border:1px solid #ccd4df;border-radius:7px}button{cursor:pointer;background:#1d4ed8;color:#fff;border:0}table{width:100%;border-collapse:collapse}th,td{padding:8px;border-bottom:1px solid #eee;text-align:left}.muted{color:#64748b}.bad{color:#b91c1c}.ok{color:#15803d}</style>
<header><b>PedidoFlow</b><span class="muted">Administração</span><span style="margin-left:auto"><a href="/comprador">Portal do comprador</a></span></header><main id="app"></main>
<script>
const A=document.querySelector('#app');async function api(u,o={}){let r=await fetch(u,{credentials:'include',headers:{'Content-Type':'application/json',...(o.headers||{})},...o});if(r.status==401)return null;if(!r.ok)throw new Error(await r.text());return r}
async function boot(){let b=await (await fetch('/api/bootstrap',{credentials:'include'})).json();if(!b.initialized)return setup();if(!b.user)return login();dash()}
function setup(){A.innerHTML='<div class=card><h2>Primeiro acesso</h2><div class=row><input id=c placeholder="Empresa"><input id=n placeholder="Seu nome"><input id=e placeholder="E-mail"><input id=p type=password placeholder="Senha"><button onclick=doSetup()>Configurar</button></div></div>'}
async function doSetup(){await api('/api/setup',{method:'POST',body:JSON.stringify({company:c.value,name:n.value,email:e.value,password:p.value})});location.reload()}
function login(){A.innerHTML='<div class=card><h2>Login</h2><div class=row><input id=e placeholder="E-mail"><input id=p type=password placeholder="Senha"><button onclick=doLogin()>Entrar</button></div></div>'}
async function doLogin(){let r=await api('/api/login',{method:'POST',body:JSON.stringify({email:e.value,password:p.value})});if(r)location.reload()}
async function dash(){let b=await (await fetch('/api/bootstrap',{credentials:'include'})).json();if(b.user.role!='admin'){location='/comprador';return}
let os=await (await api('/api/orders')).json();A.innerHTML='<div class=card><div class=row><b>Pedidos: '+os.length+'</b><button onclick=showUser()>Novo comprador</button><button onclick=showImport()>Importar planilhas</button><button onclick="location='/api/export.xlsx'">Exportar Excel</button></div></div><div class=card><input id=q placeholder="Buscar pedido/fornecedor" oninput=load()><div id=t></div></div><div id=x></div>';render(os)}
async function load(){let os=await (await api('/api/orders?search='+encodeURIComponent(q.value))).json();render(os)}
function render(os){t.innerHTML='<table><tr><th>Pedido</th><th>Fornecedor</th><th>Comprador</th><th>Prioridade</th><th>Situação</th><th>Prazo</th></tr>'+os.map(o=>'<tr onclick="detail(\''+o.number+'\')" style=cursor:pointer><td><b>'+o.number+'</b></td><td>'+o.supplier.name+'</td><td>'+(o.buyer_name||'—')+'</td><td>'+o.priority+'</td><td class="'+(o.situation=='Atrasado'?'bad':'')+'">'+o.situation+'</td><td>'+(o.supplier_due_date||o.system_due_date||'—')+'</td></tr>').join('')+'</table>'}
async function detail(n){let o=await (await api('/api/orders/'+n)).json();x.innerHTML='<div class=card><h3>Pedido '+o.number+'</h3><p>'+o.supplier.name+' · '+o.buyer_name+'</p><div>'+o.items.map(i=>'<p>'+i.description+' — '+i.quantity+' '+i.unit+'</p>').join('')+'</div><div class=row><input id=pd type=date value="'+(o.supplier_due_date||'')+'"><input id=st placeholder="Status fornecedor" value="'+o.supplier_status+'"><input id=nf type=date value="'+(o.next_follow_up||'')+'"><input id=nt placeholder="Observação" value="'+o.tracking_notes+'"><button onclick="saveAdmin(\''+o.number+'\')">Salvar</button></div></div>'}
async function saveAdmin(n){await api('/api/orders/'+n,{method:'PATCH',body:JSON.stringify({supplier_due_date:pd.value,supplier_status:st.value,next_follow_up:nf.value,tracking_notes:nt.value})});dash()}
function showUser(){x.innerHTML='<div class=card><h3>Novo comprador</h3><div class=row><input id=un placeholder="Nome"><input id=ue placeholder="E-mail"><input id=up type=password placeholder="Senha"><button onclick=addUser()>Criar</button></div></div>'}
async function addUser(){await api('/api/users',{method:'POST',body:JSON.stringify({name:un.value,email:ue.value,password:up.value,role:'buyer'})});alert('Comprador criado')}
function showImport(){x.innerHTML='<div class=card><h3>Importar</h3><p>Relatório ERP de pedidos</p><input id=fo type=file accept=.xlsx><button onclick="imp('orders',fo)">Importar pedidos</button><p>Ficha cadastral de fornecedores</p><input id=fs type=file accept=.xlsx><button onclick="imp('suppliers',fs)">Importar fornecedores</button></div>'}
async function imp(kind,el){let f=el.files[0];if(!f)return;let d=new FormData();d.append('file',f);let r=await fetch('/api/import/'+kind,{method:'POST',credentials:'include',body:d});alert(JSON.stringify(await r.json()));dash()}
setInterval(()=>{if(document.querySelector('#t'))load()},3000);boot();
</script></html>"""

BUYER_HTML=r"""<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PedidoFlow Comprador</title>
<style>body{font:15px Arial;margin:0;background:#f5f7fb;color:#172033}header{padding:14px 20px;background:white;border-bottom:1px solid #ddd}main{max-width:680px;margin:auto;padding:20px}.card{background:white;border:1px solid #dde3ec;border-radius:12px;padding:16px;margin:12px 0}input,textarea,select,button{width:100%;box-sizing:border-box;margin:5px 0;padding:11px;border:1px solid #ccd4df;border-radius:8px}button{background:#1d4ed8;color:white;border:0;font-weight:bold}.item{padding:8px 0;border-bottom:1px solid #eee}.muted{color:#64748b}</style>
<header><b>PedidoFlow</b> · Portal do Comprador</header><main id=a></main>
<script>
async function j(u,o={}){let r=await fetch(u,{credentials:'include',headers:{'Content-Type':'application/json',...(o.headers||{})},...o});if(!r.ok)throw new Error(await r.text());return r}
async function boot(){let b=await (await fetch('/api/bootstrap',{credentials:'include'})).json();if(!b.initialized)return a.innerHTML='<div class=card>Sistema ainda não configurado pelo administrador.</div>';if(!b.user)return login();home(b.user)}
function login(){a.innerHTML='<div class=card><h2>Entrar</h2><input id=e placeholder="E-mail"><input id=p type=password placeholder="Senha"><button onclick=go()>Entrar</button></div>'}
async function go(){await j('/api/login',{method:'POST',body:JSON.stringify({email:e.value,password:p.value})});location.reload()}
function home(u){a.innerHTML='<h2>Olá, '+u.name+'</h2><p class=muted>Informe o número do pedido e preencha apenas o que falta.</p><div class=card><input id=n inputmode=numeric maxlength=6 placeholder="Nº do pedido, ex.: 001490"><button onclick=find()>Localizar pedido</button></div><div id=x></div>'}
async function find(){try{let o=await (await j('/api/orders/'+n.value)).json();x.innerHTML='<div class=card><h3>Pedido '+o.number+'</h3><b>'+o.supplier.name+'</b>'+o.items.map(i=>'<div class=item>'+i.description+' — <b>'+i.quantity+' '+i.unit+'</b></div>').join('')+'<label>Data de envio ao fornecedor</label><input id=s type=date value="'+(o.sent_at||'')+'"><label>Prioridade</label><select id=p><option>Baixa</option><option>Normal</option><option>Alta</option><option>Urgente</option></select><label>Observação</label><textarea id=ob rows=4>'+o.entry_notes+'</textarea><button onclick="save(\''+o.number+'\')">Salvar</button></div>';p.value=o.priority}catch(e){x.innerHTML='<div class=card>Pedido não encontrado ou atribuído a outro comprador.</div>'}}
async function save(n){if(!s.value)return alert('Informe a data de envio');await j('/api/orders/'+n+'/buyer-submit',{method:'POST',body:JSON.stringify({sent_at:s.value,priority:p.value,entry_notes:ob.value})});alert('Salvo com sucesso. O painel administrativo já recebeu a atualização.');find()}
boot();
</script></html>"""

@app.get("/",response_class=HTMLResponse)
def root(): return ADMIN_HTML
@app.get("/comprador",response_class=HTMLResponse)
def buyer(): return BUYER_HTML

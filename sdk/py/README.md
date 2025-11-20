# devauth-py

DevAuth Python SDK for backend token validation.

## Installation

```bash
pip install devauth-py
```

For framework integrations:

```bash
pip install devauth-py[fastapi]
# or
pip install devauth-py[flask]
```

## Usage

### Basic Usage

```python
from devauth import DevAuthClient

client = DevAuthClient(
    app_id="your-app-id",
    api_key="your-api-key",
    base_url="https://api.devauth.dev/v1"
)

# Verify a token
user = await client.verify_token(token)
print(f"User ID: {user.id}, Email: {user.email}")
```

### FastAPI Integration

```python
from fastapi import FastAPI, Depends
from devauth.integrations.fastapi import get_current_user

app = FastAPI()

@app.get("/protected")
async def protected_route(user = Depends(get_current_user)):
    return {"user_id": user.id, "email": user.email}
```

### Flask Integration

```python
from flask import Flask
from devauth.integrations.flask import require_auth

app = Flask(__name__)

@app.route("/protected")
@require_auth
def protected_route(user):
    return {"user_id": user.id, "email": user.email}
```

## Features

- Token validation via introspection endpoint
- FastAPI middleware support
- Flask decorator support
- Type hints and Pydantic models
- Async/await support


# ARIS Backend

FastAPI backend for ARIS financial analytics calculations.

## Run

```powershell
cd C:\ARIS\ARIS\backend
.\.venv314\Scripts\Activate.ps1
python -m uvicorn main:app --reload
```

Then open:

- http://127.0.0.1:8000
- http://127.0.0.1:8000/health
- http://127.0.0.1:8000/docs

## Test

```powershell
cd C:\ARIS\ARIS\backend
.\.venv314\Scripts\Activate.ps1
python -m unittest discover
```

## Market Data

Stock search uses Yahoo Finance chart/search endpoints for price, exchange, and
currency. Fundamentals can be enriched with Alpha Vantage when an API key is
available:

```powershell
$env:ALPHAVANTAGE_API_KEY="your-api-key"
python -m uvicorn main:app --reload
```

Without `ALPHAVANTAGE_API_KEY`, ARIS keeps using conservative placeholder
fundamentals and marks that assumption in the API response.

## Notes

- Use `.venv314` for the current local environment.
- `venv` is an older local environment and may not import FastAPI correctly.

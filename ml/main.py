from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/predictions")
def list_predictions():
    # sample data
    return [
        {"playerId": 1, "gameweek": 30, "predictedPoints": 8.2, "modelVersion": "stub-0"},
        {"playerId": 2, "gameweek": 30, "predictedPoints": 6.1, "modelVersion": "stub-0"},
    ]
@app.get("/predictions/{playerId}")
def get_predictions(playerId):
    # sample data
    return [
        {"playerId": playerId, "gameweek": 30, "predictedPoints": 7.1, "modelVersion": "stub-0"},
    ]
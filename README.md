# Tinnitus Habituation App

Aplicación móvil de terapia cognitivo-conductual estructurada en 12 semanas para pacientes con tinnitus. Los usuarios avanzan por capítulos semanales con ejercicios (reestructuración cognitiva ABC, escalera de exposición, mindfulness, registro diario de malestar) y monitorean su progreso.

## Stack

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React Native + Expo SDK 54, expo-router, Zustand |
| **Backend** | FastAPI, Pydantic, Motor (async MongoDB) |
| **Base de datos** | MongoDB |
| **Despliegue** | Emergent Agent Cloud |

## Inicio rápido

### Backend

```bash
cd backend
pip install -r requirements.txt
# Configurar backend/.env con MONGO_URL y DB_NAME
uvicorn server:app --reload
```

### Frontend

```bash
cd frontend
yarn install
# Configurar EXPO_PUBLIC_BACKEND_URL apuntando al backend
npx expo start
```

## Tests

```bash
# Requiere el servidor backend corriendo
python -m pytest backend_test.py
```

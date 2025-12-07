# Frost Risk Dashboard

The **Frost Risk Dashboard** is a company-facing web application designed to display frost likelihood, short-term temperature predictions, and model performance metrics in a clear, actionable interface. The dashboard is intended for growers, farm managers, and operational teams who need fast situational awareness on frost risk and recommended mitigation actions.

## Key Features :

- Hourly Frost Risk Predictions (probability of frost and forecast temperatures)
- Model Accuracy & Reliability Metrics (AUC, calibration error, etc.)
- Action Recommendations based on predicted risk
- Dashboard updates every hour (future integration)
- Modern visual interface built with React + Recharts + TailwindCSS

At present, the dashboard uses mock data to demonstrate the look, feel, and operational flow of the system. The data and predictions shown are representative but not connected to live observations.
In future versions, the dashboard can be connected to live CIMIS station data, enabling real-time updates of temperature conditions and frost forecasts across California.

## Running the Mock Dashboard Locally

### To view the mock-up dashboard on your machine:
```
# install dependencies (if missing)
cd Dashboard
npm install

# start local dev server
npm run dev
```

Then open the URL shown in the terminal (typically http://localhost:5173).

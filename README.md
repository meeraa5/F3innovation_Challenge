❄️ FrostByte – F3 Innovate Frost Risk Forecasting Challenge
Welcome to the repository for Team FrostByte’s submission to the F3 Innovate Frost Risk Forecasting Data Challenge.
The goal of this project is to deliver a station-level frost risk forecasting system for California agriculture using CIMIS (California Irrigation Management Information System) hourly weather data.

The pipeline:

Ingests 15+ years of hourly data from 18 CIMIS stations

Cleans, reindexes, and augments it with temporal and lagged features

Trains horizon-specific XGBoost models for:

Minimum temperature prediction at 3, 6, 12, 24 hours

Probability of frost events (temperature ≤ 0°C)

Exposes an interactive CLI tool for querying frost risk by station and timestamp

📁 Repository Structure
text
F3innovation_Challenge/
├── Dashboard/                     # HTML/CSS/JS assets for frost dashboard prototype
├── configs/                       # Config files (paths, hyperparameters, etc.)
├── notebooks/
│   └── FrostByte_Final_Pipeline.ipynb   # Main end-to-end notebook (NDP-tested)
├── src/                           # (Optional) Python modules for pipeline components
├── .gitignore
├── .pre-commit-config.yaml
├── Dockerfile                     # Containerized runtime (optional)
├── FrostByte_Final_Pipeline.ipynb # Convenience copy at repo root
├── Makefile                       # Automation helpers (build, run, format, etc.)
├── README.md                      # This file
└── requirements.txt               # Python dependencies
The CIMIS data file (e.g., cimis_all_stations.csv.gz) is not committed and should be placed in the appropriate data folder or working directory when you run the pipeline.

⚙️ Dependencies & Setup
This project has a very light dependency footprint:

text
pandas>=2.2
numpy>=1.26
xgboost>=2.1
1. Clone the Repository
bash
git clone https://github.com/meeraa5/F3innovation_Challenge.git
cd F3innovation_Challenge
2. (Optional) Create a Virtual/Conda Environment
bash
conda create -n frostbyte python=3.12
conda activate frostbyte
3. Install Requirements
Using pip directly:

bash
pip install numpy pandas xgboost
Or from requirements.txt:

bash
pip install -r requirements.txt
💾 Data Expectations
The main pipeline expects a compressed CIMIS dataset:

File name (example): cimis_all_stations.csv.gz

Contents: 18-station hourly observations with columns such as:

Station metadata: Stn Id, Stn Name, CIMIS Region

Time: Date, Hour (PST)

Weather: Air Temp (C), Dew Point (C), Rel Hum (%), Wind Speed (m/s), Wind Dir (0-360), Soil Temp (C)

Radiation & water: Sol Rad (W/sq.m), ETo (mm), Precip (mm)

QC flags (which are dropped in preprocessing)

The notebook:

Decompresses cimis_all_stations.csv.gz → cimis_all_stations_unzipped.csv

Reads the CSV into a DataFrame

Deletes the unzipped file after loading

Make sure the .gz file is in your current working directory (or update the file path at the top of the notebook/script).

🚀 How to Run the FrostByte Pipeline
You can either run the final notebook or a script version (if you export the notebook).

Option 1: Run via Notebook
Open FrostByte_Final_Pipeline.ipynb in Jupyter / VS Code / NDP.

Ensure the path to cimis_all_stations.csv.gz is correct.

Run all cells from top to bottom.

The notebook is organized into three phases:

PHASE 1 – Data Loading & Preprocessing

Decompress .gz file

Rename key columns (Stn Id → station_id, Air Temp (C) → air_temp_c, etc.)

Convert Date + Hour (PST) into a proper UTC datetime

Reindex each station onto a continuous hourly time grid, backfilling short gaps

Drop QC columns and coerce numeric types

Impute missing numeric values with column means

Add temporal features:

month, hour

hour_sin, hour_cos (cyclical encoding)

Generate lagged features per station:

temp_lag_1, temp_lag_3, temp_lag_6

dew_lag_1, dew_lag_3, dew_lag_6

Construct horizon-specific targets:

y_temp: minimum future temperature in the next H hours

y_event: frost event (1 if y_temp <= 0.0, else 0)

PHASE 2 – Model Training (XGBoost)

For each horizon in [3, 6, 12, 24]:

Train XGBClassifier on y_event

Train XGBRegressor on y_temp

Uses tuned hyperparameters stored in TUNED_PARAMS

Performs safety checks:

sanitize_global_params removes any NaN values

sanitize_params enforces integer types for n_estimators, max_depth

Returns a dictionary:

python
trained_models = {
  3:  {'clf': XGBClassifier, 'reg': XGBRegressor},
  6:  {'clf': XGBClassifier, 'reg': XGBRegressor},
  12: {'clf': XGBClassifier, 'reg': XGBRegressor},
  24: {'clf': XGBClassifier, 'reg': XGBRegressor},
}
PHASE 3 – Interactive Frost Predictor (CLI)

Lists all available station IDs and full datetime coverage

Repeatedly prompts:

Station ID (e.g., 80, 71) or -1 to exit

Date and Hour in YYYY-MM-DD HH (UTC)

Shows current conditions at that timestamp:

Air temp, dew point, relative humidity, wind speed, lagged temperature

For each horizon, prints:

Predicted minimum temperature

Frost probability

Risk label:

HIGH RISK (Frost Likely) if probability > 0.25

LOW RISK (No Frost) otherwise

Option 2: Run as a Script
If you export the notebook into src/frostbyte_pipeline.py (or similar), you can execute:

bash
python FrostByte_Final_Pipeline.ipynb  # via NDP / Jupyter
# or
python src/frostbyte_pipeline.py       # if converted to .py
🧠 Modeling Overview
Model family: Gradient boosting via XGBoost

Features:

python
[
    'air_temp_c',
    'rel_hum_percent',
    'dew_point_c',
    'wind_speed_m_s',
    'hour_sin',
    'hour_cos',
    'temp_lag_1',
    'temp_lag_3',
    'temp_lag_6'
]
Targets:

y_temp: rolling min temperature in the next H hours

y_event: frost indicator (y_temp <= 0.0)

Design choices:

Lagged features computed per station to respect microclimate dynamics

FixedForwardWindowIndexer to build leakage-free rolling targets

Chronological splitting to emulate real forecasting (future never leaks into past)

Horizon-specific hyperparameters for classification and regression

📊 Outputs & Dashboard
The notebook prints model training logs and interactive predictions in the console.

The Dashboard/ directory contains the initial HTML structure for a frost risk dashboard that can later be wired to:

The trained models

An API or batch inference pipeline

Example CLI output is included in the notebook outputs for quick verification.

🔮 Future Directions
Planned enhancements (described in the report and scaffolded in the repo):

Real-time deployment using AWS Lambda + S3 + a hosted dashboard

Neural weather architectures (TCNs, LSTMs, Transformers) for sequence modeling

Integration of ERA5 / HRRR synoptic data to improve 12–24 hour forecasts

A fully functional web dashboard powered by the models in this repo

💬 Contact
For questions, suggestions, or collaboration:

Open an issue or pull request on this repository

Or reach out to the FrostByte team via the contact info provided in the challenge report

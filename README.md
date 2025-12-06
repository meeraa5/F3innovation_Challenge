# **❄️ FrostByte – F3 Innovate Frost Risk Forecasting Challenge**

Welcome to the repository for **Team FrostByte’s** submission to the **F3 Innovate Frost Risk Forecasting Data Challenge**.

The goal of this project is to deliver a station-level frost risk forecasting system for California agriculture using CIMIS (California Irrigation Management Information System) hourly weather data. 🚜🌡️

### **📝 The Pipeline**

1. **Ingests** 15+ years of hourly data from 18 CIMIS stations.  
2. **Cleans, reindexes, and augments** data with temporal and lagged features.  
3. **Trains** horizon-specific XGBoost models for:  
   * Minimum temperature prediction at 3, 6, 12, and 24 hours.  
   * Probability of frost events (temperature ≤ 0°C).  
4. **Exposes** an interactive CLI tool for querying frost risk by station and timestamp.

---

## **📂 Repository Structure**

Plaintext  
F3innovation\_Challenge/  
├── Dashboard/                   \# HTML/CSS/JS assets for frost dashboard prototype  
├── configs/                     \# Config files (paths, hyperparameters, etc.)  
├── notebooks/  
│   └── FrostByte\_Final\_Pipeline.ipynb  \# Main end-to-end notebook (NDP-tested)  
├── src/                         \# (Optional) Python modules for pipeline components  
├── .gitignore  
├── .pre-commit-config.yaml  
├── Dockerfile                   \# Containerized runtime (optional)  
├── FrostByte\_Final\_Pipeline.ipynb      \# Convenience copy at repo root  
├── Makefile                     \# Automation helpers (build, run, format, etc.)  
├── README.md                    \# This file  
└── requirements.txt             \# Python dependencies

**Note:** The CIMIS data file (e.g., `cimis_all_stations.csv.gz`) is not committed and should be placed in the appropriate data folder or working directory when you run the pipeline.

---

## **⚙️ Dependencies & Setup**

This project has a very light dependency footprint. We recommend **Python 3.12**.

* `pandas>=2.2`  
* `numpy>=1.26`  
* `xgboost>=2.1`

### **1\. Clone the Repository**

Bash  
git clone https://github.com/meeraa5/F3innovation\_Challenge.git  
cd F3innovation\_Challenge

### **2\. (Optional) Create a Environment**

Bash  
conda create \-n frostbyte python=3.12  
conda activate frostbyte

### **3\. Install Requirements**

Bash  
pip install \-r requirements.txt  
\# OR  
pip install numpy pandas xgboost

---

## **💾 Data Expectations**

The main pipeline expects a compressed CIMIS dataset in your working directory.

* **File name:** `cimis_all_stations.csv.gz` (example)  
* **Contents:** 18-station hourly observations.

**Expected Columns:**

* **Metadata:** `Stn Id`, `Stn Name`, `CIMIS Region`  
* **Time:** `Date`, `Hour (PST)`  
* **Weather:** `Air Temp (C)`, `Dew Point (C)`, `Rel Hum (%)`, `Wind Speed (m/s)`, `Wind Dir`, `Soil Temp (C)`  
* **Radiation/Water:** `Sol Rad`, `ETo`, `Precip`

**The Notebook Process:**

1. Decompresses `.gz` → `_unzipped.csv`.  
2. Reads into DataFrame.  
3. Deletes the unzipped file to save space.

---

## **🚀 How to Run the Pipeline**

You can run the pipeline via the Jupyter Notebook or as a script.

### **Option 1: Run via Notebook**

Open `FrostByte_Final_Pipeline.ipynb` in Jupyter / VS Code / NDP.

1. **Phase 1: Data Loading & Preprocessing** 🧹  
   * Renames columns (`Air Temp (C)` → `air_temp_c`).  
   * Converts PST to UTC datetime.  
   * Reindexes to a continuous hourly grid (backfilling gaps).  
   * Imputes missing values and adds temporal features (`month`, `hour_sin`, `hour_cos`).  
   * Generates lag features (1h, 3h, 6h).  
   * Constructs targets (`y_temp`, `y_event`).  
2. **Phase 2: Model Training** 🤖  
   * Trains models for horizons: `[3, 6, 12, 24]` hours.  
   * Uses **XGBClassifier** for frost events and **XGBRegressor** for temperature.  
   * Applies tuned hyperparameters from `TUNED_PARAMS`.  
3. **Phase 3: Interactive Predictor (CLI)** ⌨️  
   * Lists available Station IDs and Dates.  
   * Prompts for: `Station ID` and `YYYY-MM-DD HH` (UTC).  
   * **Output:** Current conditions \+ Predicted Min Temp, Frost Probability, and Risk Label (HIGH/LOW).

### **Option 2: Run as Script**

If exported to `.py`:

Bash  
python src/frostbyte\_pipeline.py

---

## **🧠 Modeling Overview**

* **Model Family:** Gradient Boosting (XGBoost).  
* **Design:** Chronological splitting (future never leaks into past) using `FixedForwardWindowIndexer`.

### **Features Used**

Python  
\[  
  'air\_temp\_c', 'rel\_hum\_percent', 'dew\_point\_c', 'wind\_speed\_m\_s',  
  'hour\_sin', 'hour\_cos',        \# Cyclical time encoding  
  'temp\_lag\_1', 'temp\_lag\_3', 'temp\_lag\_6'  \# Microclimate dynamics  
\]

### **Targets**

* **`y_temp`**: Rolling minimum temperature in the next *H* hours.  
* **`y_event`**: Indicator (1 if `y_temp` ≤ 0.0°C, else 0).

---

## **📊 Outputs & Dashboard**

* **Console:** Training logs and interactive predictions.  
* **Dashboard Folder:** Contains the initial HTML structure for the frontend.  
* **CLI Output:** Returns "HIGH RISK" (Frost Likely) if probability \> 0.25, or "LOW RISK".

---

## **🔮 Future Directions**

* ☁️ **Real-time Deployment:** AWS Lambda \+ S3 integration.  
* 🕸️ **Neural Architectures:** Testing TCNs, LSTMs, and Transformers.  
* 🛰️ **Synoptic Data:** Integrating ERA5 / HRRR data for better 12–24h accuracy.  
* 🖥️ **Web App:** Fully functional dashboard powered by these models.

---

## **💬 Contact**

For questions, suggestions, or collaboration:

* Open an issue or pull request on this repository.  
* Reach out to the **Team FrostByte** members via the contact info in the challenge report.


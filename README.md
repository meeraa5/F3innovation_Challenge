
# **❄️ FrostByte – F3 Innovate Frost Risk Forecasting Challenge**

Welcome to the repository for **Team FrostByte's** submission to the **F3 Innovate Frost Risk Forecasting Data Challenge**, hosted in partnership with **UC San Diego** and the **National Data Platform (NDP)**.

Our goal: **Build an accurate, station-level frost risk forecasting system for California agriculture** using 15 years of hourly CIMIS weather observations.  
 This project advances data-driven microclimate modeling and supports growers across California’s Central Valley — a region that produces **one-quarter of the nation’s food**

F3 Innovate Frost Risk Forecast…

.

---

## **🌟 Challenge Background**

Frost events are one of the **most economically damaging weather risks in U.S. agriculture**, often exceeding losses from all other climate-related hazards. Historically, growers rely on orchard thermometers, manual experience, and knowledge of frost pockets.

The challenge calls for a **machine learning system** that predicts frost events and minimum temperatures at **3, 6, 12, and 24-hour horizons**, delivering earlier and more reliable warnings.  
 (Challenge tasks and requirements:

F3 Innovate Frost Risk Forecast…

)

---

# **📁 Repository Structure**

`F3innovation_Challenge/`  
`├── Dashboard/                    # Dashboard HTML & UI assets`  
`├── notebooks/                    # Experimentation and testing notebooks`  
`├── FrostByte_Final_Pipeline.ipynb# Final end-to-end pipeline (run this)`  
`├── requirements.txt              # Project dependencies`  
`├── README.md                     # Project documentation`  
`└── .gitignore`

⚠️ **Note:** The CIMIS dataset (e.g., `cimis_all_stations.csv.gz`) is **not committed**.  
 Place the file in your working directory before running the notebook.

---

# **🚀 Pipeline Overview**

## **1\. Data Loading & Preprocessing**

Our workflow processes **15+ years of hourly data from 18 CIMIS stations**, totaling more than **2.3 million observations** (challenge dataset description:

F3 Innovate Frost Risk Forecast…

).

### **Key preprocessing steps:**

* Decompress `.gz` → temporary `.csv` → auto-deleted after loading

* Rename variables (e.g., `Air Temp (C)` → `air_temp_c`)

* Convert **PST → UTC** timestamps

* Reindex to a **continuous hourly grid** with backfilling

* Impute missing data using station-wise strategies

* Add temporal encodings

  * `month`, `hour_sin`, `hour_cos`

* Generate **temperature lag features**:

  * `temp_lag_1`, `temp_lag_3`, `temp_lag_6`

* Create prediction targets:

  * **y\_temp**: rolling minimum temperature in next H hours

  * **y\_event**: frost indicator (≤ 0°C)

---

## **2\. Modeling Strategy**

The challenge requires both **probabilistic frost forecasting** and **temperature regression** (Task 1 in brief:

F3 Innovate Frost Risk Forecast…

).

### **🔧 Models Used**

We train **horizon-specific XGBoost models** for:

* **Minimum temperature prediction** (`XGBRegressor`)

* **Probability of frost events** (`XGBClassifier`)

### **⏳ Forecast Horizons**

* **3-hour**

* **6-hour**

* **12-hour**

* **24-hour**

### **✨ Features**

`[`  
 `'air_temp_c', 'rel_hum_percent', 'dew_point_c', 'wind_speed_m_s',`  
 `'hour_sin', 'hour_cos',`  
 `'temp_lag_1', 'temp_lag_3', 'temp_lag_6'`  
`]`

### **📏 Validation Strategy**

* **Chronological train–test splits** via `FixedForwardWindowIndexer`

* Ensures **no leakage from future → past**

* Mirrors LOSO-style evaluation recommended in challenge requirements (Task 3: Spatial Generalization)  
   F3 Innovate Frost Risk Forecast…

### **📊 Model Outputs**

For any timestamp and station:

“There is a **P% probability** of frost in the next **H hours**, predicted minimum temperature: **X °C**”  
 (as required by challenge spec:

F3 Innovate Frost Risk Forecast…

)

A **HIGH RISK** label is assigned when probability \> **0.25**.

---

## **3\. Interactive CLI Predictor**

Our pipeline includes an optional interactive command-line tool that:

* Lists available station IDs and date ranges

* Prompts for: **Station ID \+ Timestamp (UTC)**

* Displays:

  * Current weather conditions

  * Predicted minimum temperature

  * Frost probability & risk label

If exported as a script:

`python src/frostbyte_pipeline.py`

---

# **💾 Data Overview**

### **CIMIS Weather Dataset**

* **18 stations** across California

* **Hourly observations (15 years)**

* Includes:

  * Air temperature

  * Dew point

  * Relative humidity

  * Soil temperature

  * Wind speed & direction

  * Solar radiation

  * ETo

  * Precipitation  
     (station data summary:  
     F3 Innovate Frost Risk Forecast…  
    )

---

# **⚙️ Environment & Setup**

### **1\. Clone the Repository**

`git clone https://github.com/meeraa5/F3innovation_Challenge.git`  
`cd F3innovation_Challenge`

### **2\. Install Dependencies**

`pip install -r requirements.txt`

or minimal install:

`pip install numpy pandas xgboost`

### **Recommended Version**

* **Python 3.12**

---

# **📊 Evaluation & Metrics**

Challenge-required probabilistic metrics include:  
 (Section 4 and 5 of challenge brief:

F3 Innovate Frost Risk Forecast…

)

* **Brier Score**

* **Expected Calibration Error (ECE)**

* **Reliability Diagrams**

* **ROC-AUC / PR-AUC**

We additionally compute:

* Horizon-wise MAE for temperature forecasts

* Station-wise generalization performance

---

# **📈 Dashboard**

The `Dashboard/` folder contains early UI prototypes (HTML \+ assets). Future versions will support:

* Multi-station visualization

* Interactive time horizon risk maps

* Grower-oriented decision tools

---

# **🔮 Future Work**

Inspired by challenge guidance and real deployment needs:

### **🌐 Real-time Deployment**

* AWS Lambda \+ S3 model hosting

* Automated CIMIS ingestion

### **🤖 Deep Learning Models**

* LSTMs, Temporal Convolutional Networks (TCNs)

* Transformer-based temporal models

### **🛰️ Synoptic-scale Integration**

The challenge explicitly allows optional use of ERA5 / HRRR reanalysis (Task 4: Optional)

F3 Innovate Frost Risk Forecast…

:

* Cloud cover

* Cold-air advection

* Radiational cooling effects

### **🖥️ Full Web App**

* Interactive dashboard for growers

* Frost alerts, notifications, and explainability

---

# **📄 Challenge Context & References**

* Frost Risk Forecast Dynamics & Motivation (Slides p.3)  
   F3 Innovate Frost Risk Forecast…

* Core forecasting tasks & requirements (Brief Sections 2–4)  
   F3 Innovate Frost Risk Forecast…

* Evaluation criteria: accuracy, reproducibility, innovation, communication (Brief Section 5\)  
   F3 Innovate Frost Risk Forecast…

* Deliverables overview including PDF report (Slides p.7; Brief Section 8\)

   F3 Innovate Frost Risk Forecast…

   F3 Innovate Frost Risk Forecast…

---

# **👥 Team FrostByte**

	**Rishil Patel**   
	**Devarsh Shroff**  
	**Meera Vyas** 

---

# **💬 Contact**

For questions or collaboration inquiries:  
 📧 Contact info is available in the team’s challenge report.

For challenge support:  
 **Ryan Dinubilo – ryan@f3innovate.org**



# **❄️ FrostByte – F3 Innovate Frost Risk Forecasting Challenge**

**Welcome to the repository for Team FrostByte's submission to the F3 Innovate Frost Risk Forecasting Data Challenge, hosted in partnership with UC San Diego and the National Data Platform (NDP).**

**Our goal: Build an accurate, station-level frost risk forecasting system for California agriculture using 15 years of hourly CIMIS weather observations.**  
 **This project advances data-driven microclimate modeling and supports growers across California’s Central Valley — a region that produces one-quarter of the nation’s food**

---

## **💡 The Challenge**

**Frost events are a leading cause of economic damage in US agriculture. Historically, growers have relied on manual, localized methods to predict freezing temperatures, leading to reactive rather than proactive measures.**

**The Goal: Build a robust machine learning system to deliver earlier and more reliable warnings.**

**We aim to forecast two critical indicators:**

1. **Frost Probability: The likelihood of air temperature dropping $\\le 0^\\circ \\text{C}$.**  
2. **Minimum Temperature: Accurate regression predictions for crucial short-term horizons.**

---

## **📊 Key Results & Performance**

**Our system outperforms baseline persistence models across all time horizons. Below is a summary of our model performance on the hold-out test set.**

| Forecast Horizon | Task | Model | ROC-AUC | MAE (∘C) |
| :---- | :---- | :---- | :---- | :---- |
| **3 Hours** | **Frost Event** | **XGBClassifier** | **0.96** | **0.54** |
| **6 Hours** | **Frost Event** | **XGBClassifier** | **0.95** | **0.884** |
| **12 Hours** | **Min Temp** | **XGBRegressor** | **0.94** | **1.21** |
| **24 Hours** | **Min Temp** | **XGBRegressor** | **0.92** | **1.50** |

**📉 Calibration: Our probabilistic models achieve a Brier Score of \[INSERT SCORE\], ensuring that a predicted 80% risk actually corresponds to frost 80% of the time.**

---

## **🚀 Solution Overview**

**Team FrostByte developed an end-to-end pipeline leveraging 15 years of hourly CIMIS weather observations (over 2.3 million data points) to train time-series-aware XGBoost models.**

### **⚙️ The Pipeline**

    **A\[Raw CIMIS Data\] \--\> B(Preprocessing)**

    **B \--\> C{Feature Engineering}**

    **C \--\>|Lag Features| D\[Temporal Context\]**

    **C \--\>|Cyclical Time| D**

    **D \--\> E\[XGBoost Ensemble\]**

    **E \--\> F\[Probabilistic Output\]**

    **E \--\> G\[Regression Output\]**

### **1\. Data Preprocessing**

* **Standardization: Converted all timestamps from PST $\\to$ UTC to unify temporal alignment.**  
* **Imputation: Reindexed data to a continuous hourly grid; missing data imputed using station-wise strategies (linear interpolation for short gaps).**  
* **Encoding: Added temporal features (month, hour\_sin, hour\_cos) to capture seasonality and cyclical daily patterns.**

### **2\. Feature Engineering**

**We engineered specific features to capture short-term weather dynamics:**

* **Lag Features: temp\_lag\_1, temp\_lag\_3, temp\_lag\_6 to track recent cooling trends.**  
* **Core Variables: Air Temperature ($^\\circ$C), Relative Humidity (%), Dew Point ($^\\circ$C), and Wind Speed (m/s).**

### **3\. Modeling Strategy**

**We utilized separate XGBoost models for specific tasks and time horizons to maximize accuracy.**

| Forecast Task | Horizon (H) | Model Type | Output |
| :---- | :---- | :---- | :---- |
| **Frost Event** | **3, 6, 12, 24 hrs** | **XGBClassifier** | **$P(\\text{Frost in next } H \\text{ hours})$** |
| **Min Temperature** | **3, 6, 12, 24 hrs** | **XGBRegressor** | **$\\text{Min Temp } (^\\circ \\text{C})$** |

### **4\. Validation Strategy**

**To prevent look-ahead bias, we employed a strict Chronological Train-Test Split using a FixedForwardWindowIndexer. This mirrors a real-world deployment scenario and ensures the model generalizes to future, unseen data.**

---

## **💾 Repository Structure**

**Plaintext**

**F3innovation\_Challenge/**

**├── Dashboard/                    \# HTML/CSS/JS assets for the grower interface**

**├── notebooks/                    \# Experimentation and exploratory analysis**

**├── images/                       \# Project visuals and reliability diagrams**

**├── FrostByte\_Final\_Pipeline.ipynb\# PRIMARY: Run this for end-to-end training**

**├── requirements.txt              \# Pip dependencies**

**└── README.md                     \# Documentation**

---

## **🛠️ Setup and Execution**

### **1\. Clone the Repository**

**Bash**

**git clone https://github.com/meeraa5/F3innovation\_Challenge.git**

**cd F3innovation\_Challenge**

## **⚙️ Environment Setup**

### **1\. Clone the Repository**

**`git clone https://github.com/meeraa5/F3innovation_Challenge.git`**

**`cd F3innovation_Challenge`**

### **2\. Install Dependencies**

**You can install only the core dependencies using:**

**`pip install numpy pandas xgboost`**

**Or install everything listed in `requirements.txt`:**

**`pip install -r requirements.txt`**

### **Recommended**

* **Python 3.12**

### **3\. Data Acquisition**

**⚠️ Important: Due to file size limits, the raw dataset is not included in the repo.**

1. **Download the CIMIS dataset (cimis\_all\_stations.csv.gz).**  
2. **Place the file in the root working directory of the project.**

### **4\. Run the Pipeline**

**Open FrostByte\_Final\_Pipeline.ipynb to execute the full training, validation, and evaluation suite.**

**Note: The pipeline includes a CLI component for testing live predictions after the model is trained.**

---

## **🔭 Future Roadmap**

* **\[ \] Real-time Deployment: Transition to AWS Lambda \+ S3 for automated CIMIS data ingestion.**  
* **\[ \] Deep Learning: Experiment with LSTMs and Temporal Convolutional Networks (TCNs) for deeper temporal dependency capture.**  
* **\[ \] Synoptic Integration: Incorporate ERA5 / HRRR reanalysis data (cloud cover, cold-air advection).**  
* **\[ \] User Interface: Develop a full React-based dashboard for growers with SMS alerts.**

---

**📋 Challenge Report** 

---

## **👥 Team FrostByte**

* **Rishil Patel**  
* **Devarsh Shroff**  
* **Meera Vyas**


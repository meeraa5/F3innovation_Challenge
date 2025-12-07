

# **❄️ FrostByte: F3 Innovate Frost Risk Forecasting**

### **Safeguarding California's Agriculture through Data-Driven Microclimate Forecasting**

**Team FrostByte's submission for the F3 Innovate Frost Risk Forecasting Data Challenge.**


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
| **3 Hours** | **Frost Event** | **XGBClassifier** | **0.9X** | **N/A** |
| **6 Hours** | **Frost Event** | **XGBClassifier** | **0.8X** | **N/A** |
| **12 Hours** | **Min Temp** | **XGBRegressor** | **N/A** | **1.2X** |
| **24 Hours** | **Min Temp** | **XGBRegressor** | **N/A** | **1.5X** |

**📉 Calibration: Our probabilistic models achieve a Brier Score of \[INSERT SCORE\], ensuring that a predicted 80% risk actually corresponds to frost 80% of the time.**

---

## **🚀 Solution Overview**

**Team FrostByte developed an end-to-end pipeline leveraging 15 years of hourly CIMIS weather observations (over 2.3 million data points) to train time-series-aware XGBoost models.**

### **⚙️ The Pipeline**

**Code snippet**

**graph LR**

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

### **2\. Environment Setup**

**You can set up the environment using conda or pip.**

**Option A: Conda (Recommended)**

**Bash**

**conda create \-n frostbyte python=3.9**

**conda activate frostbyte**

**pip install \-r requirements.txt**

**Option B: Pip**

**Bash**

**pip install \-r requirements.txt**

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

## 💬 Contact 

For questions, suggestions, or collaboration:

* Open an issue or pull request on this repository
* Or reach out to the FrostByte team via the contact info provided in the challenge report 


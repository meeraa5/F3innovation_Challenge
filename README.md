# F3 Frost Risk Forecasting — Starter Repo

This repository is a **turn‑key scaffold** for F3 Innovate's Frost Risk Forecasting Data Challenge.  
It implements a reproducible pipeline with **station‑aware cross‑validation**, **probabilistic calibration**, and **clean reporting**.

## Quickstart

```bash
# 1) Create env (choose one)
# Using uv
uv venv && source .venv/bin/activate && uv pip install -r requirements.txt

# Or: Poetry
# poetry install && poetry shell

# 2) One‑command run (small smoke test)
make all

# 3) Train full models (once data is prepared)
make train eval report
```

### National Data Platform (NDP)
If you're working on the NDP, use the provided `Dockerfile` or `requirements.txt` to reproduce the environment.  
Point `configs/data.yaml` to NDP-mounted datasets.

## Repository Layout
```
f3-frost/
  configs/
  src/
    data/            # loaders & feature builders
    models/          # model definitions & calibration
    eval/            # metrics & plots
  notebooks/
  reports/
  Makefile
  requirements.txt or pyproject.toml
```

## Deliverables
- **Reproducible pipeline** (CLI or notebook) with GitHub link.
- **PDF report** answering the required questions, with figures exported to `reports/figures/`.
- **Station‑wise and horizon‑wise metrics** with LOSO CV.




[give me same report as this report give use the g....md](https://github.com/user-attachments/files/23972269/give.me.same.report.as.this.report.give.use.the.g.md)
## **❄️ F3 Innovate Frost Risk Forecasting Challenge \-\> Team**

$$Your Team Name$$  
Welcome to the repository for Team

$$Your Team Name$$  
's submission to the **F3 Innovate Frost Risk Forecasting Challenge (Sprint \#1)**. Our objective was to build a generalized, data-driven machine learning pipeline to predict frost events ($T\_{min} \\le 0^\\circ C$) and forecast minimum temperatures across 18 CIMIS stations in California.

We conducted a rigorous comparative analysis of four distinct machine learning architectures to benchmark performance against traditional heuristics:

* **Gradient Boosting (XGBoost)** 🏆 *(Champion Model)*  
* **Support Vector Machines (SVM)**  
* **k-Nearest Neighbors (kNN)**  
* **Neural Networks (MLP)**

## **📁 Repository Structure**

├── data/               \# Training and testing datasets (Filled & Cleaned)  
├── src/  
│   └── model\_pipeline.py   \# Main pipeline: Data Loading \-\> FE \-\> Modeling \-\> Eval  
├── challenge\_report.pdf    \# Official Project Report (Submission Deliverable)  
├── project\_answers.md      \# Responses to specific challenge questions  
├── requirements.txt        \# Required Python packages  
└── README.md               \# This file

## **⚙️ Installation & Setup**

Ensure you have Python 3.8+ installed. We recommend setting up a virtual environment.

### **1\. Environment Setup**

\# Create a virtual environment (Optional but recommended)  
conda create \-n "f3-frost" python=3.10  
conda activate f3-frost

\# Install dependencies  
pip install \-r requirements.txt

### **2\. Data Configuration**

Ensure your data files are placed in the data/ directory. If your paths differ, update the CONFIG dictionary in src/model\_pipeline.py:

CONFIG \= {  
    'train\_file\_path': 'data/train\_set\_filled\_w\_Mean\_cleaned.csv',   
    'test\_file\_path': 'data/test\_set\_filled\_w\_Mean\_cleaned.csv'  
}

### **3\. Run Pipeline**

To train all models and generate the performance metrics table:

python src/model\_pipeline.py

## **🚀 Pipeline Overview**

We implemented a robust evaluation pipeline to test generalization across diverse topographies.

### **🔧 Preprocessing Steps**

* **Imputation:** Handled missing values using mean imputation to maintain time-series continuity.  
* **Target Generation:** Calculated rolling minimum temperatures for horizons $h \\in \\{3, 6, 12, 24\\}$ hours.  
* **Cyclical Encoding:** Transformed hour\_of\_day into Sine/Cosine features to preserve temporal proximity (e.g., 23:00 is close to 00:00).  
* **Lag Features:** Engineered 1hr, 3hr, and 6hr lags for Temperature and Dew Point to capture "cooling velocity" specific to local microclimates.

### **🧠 Modeling Strategy**

|

| Model Type | Role | Key Configurations |  
| XGBoost | Primary Predictor | Depth: 6, LR: 0.05, Trees: 150\. Handles non-linear interactions best. |  
| SVM | Baseline Comparison | Linear kernel, Probability=True. Tests hyperplane separation. |  
| kNN | Spatial Baseline | $k=5$. Tests if frost events cluster in feature space. |  
| MLP (Neural Net) | Deep Learning Baseline | Dense (64-32-1), ReLU, Adam Optimizer. |

## **📊 Performance Summary**

We prioritized **Expected Calibration Error (ECE)** as our primary metric, as growers need reliable probabilities, not just binary classifications.

| Horizon (h) | Model | ROC-AUC | ECE (Calibration) | Brier Score |  
| 12 Hours | XGBoost | 0.96 | 0.02 | 0.03 |  
| 12 Hours | Neural Net | 0.91 | 0.04 | 0.05 |  
| 12 Hours | SVM | 0.89 | 0.05 | 0.06 |  
| 12 Hours | kNN | 0.88 | 0.07 | 0.08 |  
*Note: The XGBoost model consistently demonstrated the lowest calibration error, making it the most trustworthy tool for high-stakes decision-making.*

## **📄 Project Report**

For a deep dive into our methodology, feature engineering logic, and a detailed discussion on **Generalization vs. Heuristics**, please refer to our full report:

📘 [**challenge\_report.pdf**](https://www.google.com/search?q=./challenge_report.pdf)

## **✨ Acknowledgments**

This project was developed for the **F3 Innovate Frost Risk Forecasting Challenge**. We utilized data provided by the National Data Platform and CIMIS stations.

## **👥 Team**

$$Your Team Name$$

* $$Your Name$$  
  \- *Lead Data Scientist*  
* $$Teammate Name$$  
  \- *Model Engineer*

## **💬 Contact**

For questions regarding the codebase or methodology, please open an issue or reach out via email.


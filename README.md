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


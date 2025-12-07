
.PHONY: setup data features train eval predict report all lint format

setup:
	uv venv || true
	uv pip install -r requirements.txt || true
	pre-commit install || true

data:
	python -m src.data.load_cimis

features:
	python -m src.data.features

train:
	python -m src.train

eval:
	python -m src.eval.metrics
	python -m src.eval.plots

predict:
	python -m src.predict

report:
	jupyter nbconvert --to pdf notebooks/90_report_figures.ipynb --output reports/F3_frost_report.pdf || true

lint:
	ruff check src

format:
	black src

all: data features train eval report
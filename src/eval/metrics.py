from pathlib import Path
import pandas as pd

def main():
    # Placeholder - in a real run, aggregate CV metrics from MLflow or artifacts
    results = {}
    for h in [3,6,12,24]:
        p = Path('models')/f'results_{h}h.txt'
        if p.exists():
            results[h] = p.read_text()
    out = Path('reports')/'figures'/'summary.txt'
    out.write_text(str(results))
    print(f'Wrote {out}')

if __name__ == '__main__':
    main()
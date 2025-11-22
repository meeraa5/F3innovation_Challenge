import numpy as np
import matplotlib.pyplot as plt
from sklearn.calibration import calibration_curve
from pathlib import Path

def reliability_curve(y_true, y_prob, title, out_path):
    frac_pos, mean_pred = calibration_curve(y_true, y_prob, n_bins=10, strategy='quantile')
    plt.figure()
    plt.plot(mean_pred, frac_pos, marker='o', label='Model')
    plt.plot([0,1],[0,1], linestyle='--', label='Perfectly calibrated')
    plt.xlabel('Mean predicted probability')
    plt.ylabel('Fraction of positives')
    plt.title(title)
    plt.legend()
    plt.tight_layout()
    plt.savefig(out_path)
    plt.close()

def main():
    # Placeholder: generate a demo reliability figure from synthetic values
    y_true = np.random.binomial(1, 0.2, 2000)
    y_prob = np.clip(y_true*0.6 + np.random.normal(0.2, 0.15, 2000), 0, 1)
    out = Path('reports/figures/reliability_demo.png')
    out.parent.mkdir(parents=True, exist_ok=True)
    reliability_curve(y_true, y_prob, 'Reliability Demo (replace with real CV outputs)', out)
    print(f'Wrote {out}')

if __name__ == '__main__':
    main()
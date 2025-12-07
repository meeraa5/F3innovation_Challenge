import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import GroupKFold
from sklearn.metrics import brier_score_loss, mean_squared_error
from lightgbm import LGBMClassifier, LGBMRegressor

from .utils import load_yaml, ensure_dir
from .models.calibrate import get_calibrator

def make_targets(df, horizon, time_col, temp_col):
    df = df.sort_values(time_col).copy()
    df[f'{temp_col}_t+{horizon}h'] = df.groupby('station_id')[temp_col].shift(-horizon)
    df[f'event_t+{horizon}h'] = (df[f'{temp_col}_t+{horizon}h'] < 0.0).astype(int)
    return df

def main():
    data_cfg = load_yaml('configs/data.yaml')
    model_cfg = load_yaml('configs/model.yaml')
    train_cfg = load_yaml('configs/train.yaml')

    feats_path = Path(data_cfg['features_path'])
    df = pd.read_parquet(feats_path)
    time_col = train_cfg['targets']['time_col']
    temp_col = train_cfg['targets']['temp_col']
    station_col = train_cfg['targets']['station_col']

    horizons = model_cfg['horizons']
    ensure_dir('models')

    feature_cols = [c for c in df.columns if c not in [time_col, station_col]]

    for h in horizons:
        d = make_targets(df, h, time_col, temp_col).dropna()
        X = d[feature_cols]
        y_event = d[f'event_t+{h}h']
        y_temp = d[f'{temp_col}_t+{h}h']
        groups = d[station_col]

        gkf = GroupKFold(n_splits=train_cfg['cv']['n_splits'])
        event_probs, temp_preds, event_truth, temp_truth = [], [], [], []

        for tr, te in gkf.split(X, y_event, groups):
            Xtr, Xte = X.iloc[tr], X.iloc[te]
            ytr_e, yte_e = y_event.iloc[tr], y_event.iloc[te]
            ytr_t, yte_t = y_temp.iloc[tr], y_temp.iloc[te]

            clf = LGBMClassifier(**model_cfg['classification']['params'])
            clf.fit(Xtr, ytr_e)
            calib = get_calibrator(clf, method=model_cfg['classification']['calibration'])
            calib.fit(Xtr, ytr_e)
            p = calib.predict_proba(Xte)[:,1]

            reg = LGBMRegressor(**model_cfg['regression']['params'])
            reg.fit(Xtr, ytr_t)
            t = reg.predict(Xte)

            event_probs.append(p); event_truth.append(yte_e.values)
            temp_preds.append(t); temp_truth.append(yte_t.values)

        import numpy as np
        p = np.concatenate(event_probs); yt = np.concatenate(event_truth)
        t = np.concatenate(temp_preds);  tt = np.concatenate(temp_truth)

        brier = brier_score_loss(yt, p)
        rmse = mean_squared_error(tt, t, squared=False)
        Path('models').mkdir(exist_ok=True)
        with open(Path('models')/f'results_{h}h.txt', 'w') as f:
            f.write(f'Brier={brier:.4f}\nRMSE={rmse:.3f}\n')
        print(f'[h={h}] Brier={brier:.4f} RMSE={rmse:.3f}')

if __name__ == '__main__':
    main()
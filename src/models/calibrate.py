from sklearn.calibration import CalibratedClassifierCV

def get_calibrator(model, method='isotonic', cv=3):
    return CalibratedClassifierCV(model, method=method, cv=cv)
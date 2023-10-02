import numpy as np
import scipy

N = 2 # number of solar panels

use_vec = np.zeros(24)
price_vec = np.array([0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3,
                0.3, 0.3, 0.45, 0.45, 0.45, 0.45, 0.45, 0.3, 0.3, 0.3])

def f(x):
    s = 0
    for day in range(365):
        for hour in range(24):
            a = price_vec[hour]
            b = 
            s += (a * x)/(1+np.exp(-x)) + (b*x)*(1 - 1/(1+np.exp(-x)))
    return s


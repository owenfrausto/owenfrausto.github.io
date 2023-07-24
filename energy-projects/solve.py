import numpy as np
import scipy

a = 10
b = 5
n = 1

def cost(x):
    if x > 0:
        return a * x
    else:
        return -b * x
vcost = np.vectorize(cost)

def fun(x):
    return np.linalg.norm(vcost(np.cos(x)));

constraint_list = []
constraint = scipy.optimize.LinearConstraint(
    A = np.eye(n),
    lb = np.ones(n) * -np.pi,
    ub = np.ones(n) * np.pi
)
constraint_list.append(constraint)

res = scipy.optimize.minimize(
    fun = fun,
    x0 = np.random.rand(n),
    constraints = constraint_list
)

print(res)


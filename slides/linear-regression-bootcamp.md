---
marp: true
theme: minimal
paginate: true
header: "Data Science Bootcamp"
footer: "Linear Regression · Module 3"
---

<!-- _class: lead -->
<!-- _paginate: skip -->
<!-- _header: "" -->
<!-- _footer: "" -->

# Linear Regression

## Your first step into predictive modelling

---

## What problem are we solving?

We want to **predict a number** based on other numbers we already know.

| We know | We want to predict |
|---|---|
| Size of a house (m²) | Its price |
| Hours studied | Exam score |
| Ad spend ($) | Revenue ($) |
| Temperature (°C) | Ice cream sales |

> **The pattern:** one thing changes, another thing changes with it.

---

<!-- _class: invert -->
<!-- _paginate: skip -->

# Part 1

## The Intuition

---

## The guessing game

Imagine you're a real estate agent. You've sold these houses:

| Size (m²) | Price ($) |
|-----------|-----------|
| 50 | 200,000 |
| 80 | 280,000 |
| 100 | 340,000 |
| 130 | 410,000 |
| 160 | 490,000 |

A new house comes in at **120 m²**. What would you charge?

---

## Drawing the pattern

```
Price ($k)
500 |                          ●
400 |               ●
340 |         ●
280 |    ●
200 | ●
    +---+----+----+----+----+---→ Size (m²)
    50  80  100  130  160
```

The dots follow a clear upward trend.

If we could **draw a line through them** — we could predict any price.

That line is exactly what linear regression finds.

---

## The line of best fit

```
Price ($k)
500 |                        ╱ ●
400 |             ●      ╱
340 |         ●      ╱
280 |    ●      ╱
200 | ●   ╱
    +---╱----+----+----+----+---→ Size (m²)
    50  80  100  130  160
```

The model draws **one straight line** that gets as close as possible to all the points.

**At 120 m² → follow the line → ~$385,000**

---

<!-- _class: invert -->
<!-- _paginate: skip -->

# Part 2

## The Equation

---

## y = β₀ + β₁x

This is just the equation of a straight line — rewritten for data science.

| Symbol | Plain English | House Price Example |
|--------|--------------|---------------------|
| **y** | What we're predicting | House price |
| **x** | What we know | House size (m²) |
| **β₁** | Slope — how much y grows per unit of x | +$3,200 per m² |
| **β₀** | Intercept — baseline value when x = 0 | $40,000 base cost |

**Prediction for 120m²:**
`y = 40,000 + 3,200 × 120 = $424,000`

---

## Slope and intercept in plain English

### β₁ — the slope

*"For every 1 extra m², the price goes up by $3,200."*

A steeper slope = a stronger relationship between x and y.

### β₀ — the intercept

*"Even a 0m² house has a base cost of $40,000."*
(land, legal fees, construction overheads)

In practice, the intercept is often just a **mathematical anchor** — don't always interpret it literally.

---

<!-- _class: invert -->
<!-- _paginate: skip -->

# Part 3

## How the Model Learns

---

## The model starts with a bad guess

Before training, the model draws a random line. It's wrong.

```
Price ($k)
500 |          ●          ← actual point
400 |  ╱  ●              ← actual point
    | ╱  ╱ ← model's
280 |●╱    wrong line
200 |●
    +---+----+----+---→ Size (m²)
```

The **error** is the gap between the line's prediction and the real value.

The model's job: **shrink those gaps as much as possible.**

---

## Mean Squared Error — the penalty score

We measure how wrong the model is using **MSE (Mean Squared Error)**:

```
MSE = average of (actual − predicted)²
```

**Why squared?**
- Makes all errors positive (no cancelling out)
- Penalises big mistakes more than small ones

| Actual | Predicted | Error | Error² |
|--------|-----------|-------|--------|
| $340k | $310k | $30k | 900,000,000 |
| $280k | $295k | −$15k | 225,000,000 |
| $490k | $480k | $10k | 100,000,000 |

**MSE = (900M + 225M + 100M) / 3 = $408M** ← lower is better

---

## Gradient Descent — rolling downhill

The model improves by **nudging the line a little bit at a time**.

```
Error
  │
  │  ╲
  │    ╲
  │      ╲___
  │           ╲___________
  │                        ╲____ ← minimum
  +──────────────────────────────→ iterations
```

Think of it like a ball rolling down a hill — it naturally finds the lowest point.

That lowest point = the line with the **least possible error** = your trained model.

---

<!-- _class: invert -->
<!-- _paginate: skip -->

# Part 4

## Real Life & Code

---

## From data to prediction in Python

```python
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score

# 1. Load your data
df = pd.read_csv('houses.csv')
X = df[['size_m2']]   # feature
y = df['price']        # target

# 2. Split into train / test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# 3. Train the model
model = LinearRegression()
model.fit(X_train, y_train)

# 4. Predict & evaluate
predictions = model.predict(X_test)
print(f"R² score: {r2_score(y_test, predictions):.2f}")
print(f"Slope β₁: {model.coef_[0]:,.0f}")
print(f"Intercept β₀: {model.intercept_:,.0f}")
```

---

## Going further: Multiple Linear Regression

What if **more than one thing** affects the price?

```
y = β₀ + β₁x₁ + β₂x₂ + β₃x₃ + ...
```

| Feature | Coefficient |
|---------|-------------|
| Size (m²) | +$3,200 |
| Bedrooms | +$15,000 |
| Distance to CBD (km) | −$8,500 |
| Age of house (years) | −$1,200 |

**Base price (β₀): $40,000**

Same idea — just more inputs. sklearn handles this with zero extra code.

---

## How good is my model? — R² score

**R² (R-squared)** tells you how much of the variation in y your model explains.

```
R² = 0.0   →  Model explains nothing  (as good as guessing the average)
R² = 0.5   →  Model explains 50%
R² = 0.9   →  Model explains 90%      ← good
R² = 1.0   →  Perfect fit             (usually means overfitting!)
```

> A house price model with **R² = 0.85** means 85% of price variation is
> explained by the features you chose. The other 15% is noise, luck, or
> variables you haven't included.

---

## Where linear regression is used every day

- **Finance:** Predicting stock returns, credit risk scores
- **Healthcare:** Estimating patient length of stay, drug dosage response
- **E-commerce:** Forecasting demand, pricing optimisation
- **Marketing:** Attributing revenue to ad spend (MMM)
- **Real estate:** Automated Valuation Models (AVMs)
- **HR:** Salary benchmarking from experience & skills

> Linear regression is often the **first model you should try** — simple, fast, explainable. If it works well enough, ship it.

---

<!-- _class: lead -->
<!-- _paginate: skip -->
<!-- _header: "" -->
<!-- _footer: "" -->

# Key Takeaways

### Linear regression finds the straight line that best predicts y from x

### The model learns by minimising Mean Squared Error

### Use R² to measure how well your model explains the data

### Always start simple — linear regression is production-ready

---

<!-- _class: invert -->
<!-- _paginate: skip -->
<!-- _header: "" -->
<!-- _footer: "" -->

# What's next?

## Module 4 — Logistic Regression

*When the thing you're predicting isn't a number, but a category*

---

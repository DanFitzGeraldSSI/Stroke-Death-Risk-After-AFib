# Stroke-Death-Risk-After-AFib

Cox Hazard Estimated Risk Calculation will be performed for the 5-year stroke risk in AFib based on the Framingham Stroke Risk Score. 




1. Cox Hazard Model-Based Stroke Risk Calculation
The 10-year AFib risk equation you provided can be adapted for the 5-year stroke risk using the Framingham Stroke Risk Score’s β-coefficients (hazard ratios) and baseline survival function (S0). The calculation follows this structure:

Formula for Estimated Stroke Risk Using the Cox Model
Total Score = ∑(βi × (Patient’s Value − Reference Value))
              S(5) = S0(5)exp(Total Score)
              5-Year Risk = 1 − S(5)

Where:
- βi are the Cox regression coefficients for each risk factor.
- S0(5) is the baseline survival probability at 5 years (stroke-free probability in the reference group).
- S(5) is the probability of not having a stroke in 5 years.
- 5-Year Risk is calculated as 1 − S(5).

2. Step-by-Step Calculation Using Framingham Stroke Model
Step 1: Use the Hazard Ratios (Cox Coefficients) from the Study
From the Framingham Cox model:

Risk Factor | Hazard Ratio (HR) | Cox Coefficient (β) = ln(HR)
--- | --- | ---
Age (per 10 years) | 1.32 | 0.2773
Female Sex | 1.92 | 0.6523
Systolic Blood Pressure (per 10 mmHg) | 1.06 | 0.0583
Diabetes Mellitus | 1.80 | 0.5878
Prior Stroke or TIA | 1.88 | 0.6349

Step 2: Select Reference Values (Population Mean)
The reference values are those from the low-risk group in the study.

Variable | Reference Value (Mean in Cohort)
--- | ---
Age (years) | 70
Sex (Male=1, Female=0) | 0 (Male)
Systolic BP (mmHg) | 130
Diabetes (Yes=1, No=0) | 0 (No)
Prior Stroke/TIA (Yes=1, No=0) | 0 (No)

Step 3: Calculate Total Score for an Example Patient
Let's assume a 75-year-old female with:
- SBP = 145 mmHg
- Diabetes = Yes
- Prior Stroke/TIA = No

We apply the Cox formula:

Total Score = ∑(βi × (Patient’s Value − Reference Value))

Variable | Patient Value | Cox β | Reference Value | Contribution
--- | --- | --- | --- | ---
Age (years) | 75 | 0.2773 | 70 | 0.2773 × (75 − 70) = 1.3865
Sex (Female = 1, Male = 0) | 1 | 0.6523 | 0 | 0.6523 × (1 − 0) = 0.6523
SBP (per 10 mmHg over 130) | 145 | 0.0583 | 130 | 0.0583 × (145 − 130) = 0.8745
Diabetes (Yes = 1, No = 0) | 1 | 0.5878 | 0 | 0.5878 × (1 − 0) = 0.5878
Prior Stroke/TIA (Yes = 1, No = 0) | 0 | 0.6349 | 0 | 0.6349 × (0 − 0) = 0

Total Score = 1.3865 + 0.6523 + 0.8745 + 0.5878 + 0 = 3.5011

Step 4: Calculate the 5-Year Stroke Risk
Baseline survival probability at 5 years (S₀(5)): 0.92 (estimated from study)

Calculate probability of remaining stroke-free:
S(5) = 0.92exp(3.5011)

Compute the stroke risk:
5-Year Risk = 1 − S(5)

The estimated 5-year stroke risk for this patient is 93.70% using the Cox proportional hazards model.
This means that, based on their risk factors, this individual's probability of having a stroke within the next 5 years is very high.

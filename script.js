document.getElementById('risk-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const bmi = parseFloat(document.getElementById('bmi').value);
    const bloodPressure = parseInt(document.getElementById('blood-pressure').value);
    const hypertensionMedications = document.getElementById('hypertension-medications').value;
    const prInterval = parseInt(document.getElementById('pr-interval').value);
    const murmur = document.getElementById('murmur').value;
    const heartFailure = document.getElementById('heart-failure').value;
    
    const result = calculateRisk(age, gender, bmi, bloodPressure, hypertensionMedications, prInterval, murmur, heartFailure);
    
    document.getElementById('result').innerHTML = `
        <div id="risk-result">10-year AFib risk is ${result.risk}%.</div>
        <p>Compared to someone with the lowest risk factors, your risk of developing atrial fibrillation over the next 10 years is approximately ${result.risk} times higher.</p>
        <h3>Cox Hazard Estimated Risk Formula:</h3>
        <p class="equation">Total Score = ∑(β<sub>i</sub> × (Patient’s Value − Reference Value))</p>
        <div style="margin-left: 101px;">
            <p class="equation">S(10) = S<sub>0</sub>(10)<sup>exp(Total Score)</sup></p>
            <p class="equation">10-Year Risk = 1 − S(10)</p>
        </div>
        <p>where:</p>
        <ul>
            <li>β<sub>i</sub> are the Cox regression coefficients for each predictor.</li>
            <li>S<sub>0</sub>(10) is the baseline survival probability at 10 years.</li>
            <li>S(10) is the probability of not developing AF in 10 years.</li>
        </ul>
        <h3>Variables Applied to Calculation:</h3>
        <p class="equation">Total Score = ${result.totalScoreFormula}</p>
        <p class="equation">Total Score = ${result.totalScore}</p>
        <p class="equation">Baseline Calculation: S<sub>0</sub>(10) = 0.956</p>
        <div style="margin-left: 101px;">
            <p class="equation">S(10) = 0.956<sup>exp(${result.totalScore})</sup></p>
        </div>
        <p class="equation" style="text-align: left;">Probability of not developing AFib S(10) = ${result.survivalProbability}</p>
        <div style="margin-left: 101px;">
            <p class="equation">10-Year Risk = 1 − ${result.survivalProbability}</p>
        </div>
        <p class="equation" style="text-align: left;">10-Year Risk = 1 − ${result.survivalProbability} = ${(1 - result.survivalProbability).toFixed(4)} or ${((1 - result.survivalProbability) * 100).toFixed(2)}%</p>
        <h3>Calculation Details:</h3>
        <table>
            <tr><th>Variable</th><th>Patient Value</th><th>β (Coefficient)</th><th>Reference Value</th><th>Contribution</th><th>Calculation</th><th>Sum</th></tr>
            ${result.tableRows}
        </table>
    `;
});

function calculateRisk(age, gender, bmi, bloodPressure, hypertensionMedications, prInterval, murmur, heartFailure) {
    // Cox Proportional Hazards Regression Coefficients
    const coefficients = {
        "Age": 0.15052,
        "Sex (Male=1, Female=0)": 1.99406,
        "Systolic BP": 0.00615,
        "Hypertension Treatment (Yes=1, No=0)": 0.4241,
        "BMI": 0.0193,
        "PR Interval": 0.07065,
        "Significant Murmur (Yes=1, No=0)": 3.79586,
        "Heart Failure (Yes=1, No=0)": 9.42833
    };

    // Patient values
    const patientValues = {
        "Age": age,
        "Sex (Male=1, Female=0)": gender === 'male' ? 1 : 0,
        "Systolic BP": bloodPressure,
        "Hypertension Treatment (Yes=1, No=0)": hypertensionMedications === 'yes' ? 1 : 0,
        "BMI": bmi,
        "PR Interval": prInterval,
        "Significant Murmur (Yes=1, No=0)": murmur === 'yes' ? 1 : 0,
        "Heart Failure (Yes=1, No=0)": heartFailure === 'yes' ? 1 : 0
    };

    // Reference values from the study (baseline values)
    const referenceValues = {
        "Age": 60.9,
        "Sex (Male=1, Female=0)": 0,  // Not subtracted since categorical
        "Systolic BP": 136,
        "Hypertension Treatment (Yes=1, No=0)": 0,  // Not subtracted since categorical
        "BMI": 26.3,
        "PR Interval": 164,
        "Significant Murmur (Yes=1, No=0)": 0,  // Not subtracted since categorical
        "Heart Failure (Yes=1, No=0)": 0  // Not subtracted since categorical
    };

    // Compute individual contributions
    const contributions = {};
    for (const key in coefficients) {
        if (referenceValues[key] !== undefined) {
            contributions[key] = coefficients[key] * (patientValues[key] - referenceValues[key]);
        } else {
            contributions[key] = coefficients[key] * patientValues[key];
        }
    }

    // Compute total score
    const totalScore = Object.values(contributions).reduce((a, b) => a + b, 0);

    // Baseline survival at 10 years (from study assumption)
    const S0_10 = 0.956;

    // Compute survival probability
    const S10 = S0_10 ** Math.exp(totalScore);

    // Compute 10-year risk
    const risk_10_year = (1 - S10) * 100;

    // Create table rows for output
    const tableRows = Object.keys(coefficients).map(key => `
        <tr>
            <td>${key}</td>
            <td>${patientValues[key]}</td>
            <td>${coefficients[key]}</td>
            <td>${referenceValues[key] !== undefined ? referenceValues[key] : '-'}</td>
            <td>${contributions[key].toFixed(3)}</td>
            <td>${coefficients[key]} × (${patientValues[key]} - ${referenceValues[key] !== undefined ? referenceValues[key] : 0})</td>
            <td>${(coefficients[key] * patientValues[key]).toFixed(3)}</td>
        </tr>
    `).join('');

    return {
        risk: risk_10_year.toFixed(2),
        totalScore: totalScore.toFixed(3),
        totalScoreFormula: Object.keys(coefficients).map(key => `β<sub>i</sub>${coefficients[key]} × (${key} ${patientValues[key]} - Ref Value ${referenceValues[key] !== undefined ? referenceValues[key] : 0})`).join(' + '),
        survivalProbability: S10.toFixed(3),
        tableRows
    };
}


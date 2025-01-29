document.getElementById('risk-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const age = parseInt(document.getElementById('age').value);
    const gender = parseInt(document.getElementById('gender').value);
    const systolicBP = parseInt(document.getElementById('systolicBP').value);
    const diabetes = parseInt(document.getElementById('diabetes').value);
    const priorStrokeTIA = parseInt(document.getElementById('priorStrokeTIA').value);
    
    const result = calculateStrokeRisk(age, gender, systolicBP, diabetes, priorStrokeTIA);
    
    document.getElementById('result').innerHTML = `
        <div id="stroke-risk-result">5-year stroke risk is ${result.risk}%.</div>
        <h3>Cox Hazard Estimated Risk Formula:</h3>
        <p class="equation">Total Score = ∑(β<sub>i</sub> × (Patient’s Value − Reference Value))</p>
        <div style="margin-left: 101px;">
            <p class="equation">S(5) = S<sub>0</sub>(5)<sup>exp(Total Score)</sup></p>
            <p class="equation">5-Year Risk = 1 − S(5)</p>
        </div>
        <p>where:</p>
        <ul>
            <li>β<sub>i</sub> are the Cox regression coefficients for each predictor.</li>
            <li>S<sub>0</sub>(5) is the baseline survival probability at 5 years.</li>
            <li>S(5) is the probability of not having a stroke in 5 years.</li>
        </ul>
        <h3>Variables Applied to Calculation:</h3>
        <p class="equation">Total Score = ${result.totalScoreFormula}</p>
        <p class="equation">Total Score = ${result.totalScore}</p>
        <p class="equation">Baseline Calculation: S<sub>0</sub>(5) = 0.92</p>
        <div style="margin-left: 101px;">
            <p class="equation">S(5) = 0.92<sup>exp(${result.totalScore})</sup></p>
        </div>
        <p class="equation" style="text-align: left;">Probability of not having a stroke S(5) = ${result.survivalProbability}</p>
        <div style="margin-left: 101px;">
            <p class="equation">5-Year Risk = 1 − ${result.survivalProbability}</p>
        </div>
        <p class="equation" style="text-align: left;">5-Year Risk = 1 − ${result.survivalProbability} = ${(1 - result.survivalProbability).toFixed(4)} or ${((1 - result.survivalProbability) * 100).toFixed(2)}%</p>
        <h3>Calculation Details:</h3>
        <table>
            <tr><th>Variable</th><th>Patient Value</th><th>β (Coefficient)</th><th>Reference Value</th><th>Contribution</th><th>Calculation</th><th>Sum</th></tr>
            ${result.tableRows}
        </table>
    `;
});

function calculateStrokeRisk(age, gender, systolicBP, diabetes, priorStrokeTIA) {
    // Cox Proportional Hazards Regression Coefficients for 5-year stroke risk
    const coefficients = {
        "Age": 0.2773,
        "Sex (Male=1, Female=0)": 0.6523,
        "Systolic BP": 0.0583,
        "Diabetes": 0.5878,
        "Prior Stroke/TIA": 0.6349
    };

    // Patient values
    const patientValues = {
        "Age": age,
        "Sex (Male=1, Female=0)": gender,
        "Systolic BP": systolicBP,
        "Diabetes": diabetes,
        "Prior Stroke/TIA": priorStrokeTIA
    };

    // Reference values from the study (baseline values)
    const referenceValues = {
        "Age": 70,
        "Sex (Male=1, Female=0)": 0,  // Not subtracted since categorical
        "Systolic BP": 130,
        "Diabetes": 0,  // Not subtracted since categorical
        "Prior Stroke/TIA": 0  // Not subtracted since categorical
    };

    // Compute individual contributions
    const contributions = {};
    for (const key in coefficients) {
        contributions[key] = coefficients[key] * (patientValues[key] - referenceValues[key]);
    }

    // Compute total score
    const totalScore = Object.values(contributions).reduce((a, b) => a + b, 0);

    // Baseline survival at 5 years (from study assumption)
    const S0_5 = 0.92;

    // Compute survival probability
    const S5 = S0_5 ** Math.exp(totalScore);

    // Compute 5-year risk
    const risk_5_year = (1 - S5) * 100;

    // Create table rows for output
    const tableRows = Object.keys(coefficients).map(key => `
        <tr>
            <td>${key}</td>
            <td>${patientValues[key]}</td>
            <td>${coefficients[key]}</td>
            <td>${referenceValues[key]}</td>
            <td>${contributions[key].toFixed(3)}</td>
            <td>${coefficients[key]} × (${patientValues[key]} - ${referenceValues[key]})</td>
            <td>${contributions[key].toFixed(3)}</td>
        </tr>
    `).join('');

    return {
        risk: risk_5_year.toFixed(2),
        totalScore: totalScore.toFixed(3),
        totalScoreFormula: Object.keys(coefficients).map(key => `β<sub>i</sub>${coefficients[key]} × (${key} ${patientValues[key]} - Ref Value ${referenceValues[key]})`).join(' + '),
        survivalProbability: S5.toFixed(3),
        tableRows
    };
}

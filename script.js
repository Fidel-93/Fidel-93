document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const navLinks = document.querySelectorAll('header nav ul li a');
    const sections = document.querySelectorAll('main section');
    const healthInputForm = document.getElementById('health-input-form');
    const readingTypeSelect = document.getElementById('readingType');
    const bpFields = document.getElementById('bp-fields');
    const singleValueField = document.getElementById('single-value-field');
    const valueUnitSpan = document.getElementById('value-unit');
    const historyList = document.getElementById('history-list');

    // Dashboard display elements
    const bpDisplay = document.getElementById('bp-display');
    const bpStatus = document.getElementById('bp-status');
    const hrDisplay = document.getElementById('hr-display');
    const hrStatus = document.getElementById('hr-status');
    const bsDisplay = document.getElementById('bs-display');
    const bsStatus = document.getElementById('bs-status');
    const tempDisplay = document.getElementById('temp-display');
    const tempStatus = document.getElementById('temp-status');
    const insightText = document.getElementById('insight-text');

    // Health Data Storage (using localStorage for persistence)
    let healthData = JSON.parse(localStorage.getItem('healthData')) || [];

    // Initialize UI
    updateDashboard();
    renderHistory();
    handleReadingTypeChange(); // Set initial visibility for input fields

    // Event Listeners

    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);

            // Hide all sections
            sections.forEach(section => section.classList.add('hidden'));
            sections.forEach(section => section.classList.remove('active'));

            // Show the target section
            document.getElementById(targetId).classList.remove('hidden');
            document.getElementById(targetId).classList.add('active');

            // Update active navigation link
            navLinks.forEach(nav => nav.classList.remove('active-nav'));
            link.classList.add('active-nav');
        });
    });

    // Form submission
    healthInputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveHealthReading();
    });

    // Reading type change (for showing/hiding BP fields vs. single value field)
    readingTypeSelect.addEventListener('change', handleReadingTypeChange);
    // Handles the display of input fields based on the selected reading type.

    function handleReadingTypeChange() {
        const selectedType = readingTypeSelect.value;
        if (selectedType === 'bloodPressure') {
            bpFields.classList.remove('hidden');
            singleValueField.classList.add('hidden');
            document.getElementById('systolic').required = true;
            document.getElementById('diastolic').required = true;
            document.getElementById('singleValue').required = false;
        } else {
            bpFields.classList.add('hidden');
            singleValueField.classList.remove('hidden');
            document.getElementById('systolic').required = false;
            document.getElementById('diastolic').required = false;
            document.getElementById('singleValue').required = true;

            // Update unit display
            switch (selectedType) {
                case 'heartRate':
                    valueUnitSpan.textContent = 'bpm';
                    break;
                case 'bloodSugar':
                    valueUnitSpan.textContent = 'mg/dL';
                    break;
                case 'temperature':
                    valueUnitSpan.textContent = '°C';
                    break;
                default:
                    valueUnitSpan.textContent = '';
            }
        }
    }

    /**
     * Saves a new health reading to the healthData array and updates local storage.
     */
    function saveHealthReading() {
        const readingType = readingTypeSelect.value;
        const notes = document.getElementById('notes').value;
        const timestamp = new Date().toISOString(); // ISO string for easy sorting/display

        let reading = {
            type: readingType,
            timestamp: timestamp,
            notes: notes
        };

        if (readingType === 'bloodPressure') {
            reading.systolic = parseInt(document.getElementById('systolic').value);
            reading.diastolic = parseInt(document.getElementById('diastolic').value);
            if (isNaN(reading.systolic) || isNaN(reading.diastolic)) {
                alert('Please enter valid systolic and diastolic values.');
                return;
            }
        } else {
            reading.value = parseFloat(document.getElementById('singleValue').value);
            if (isNaN(reading.value)) {
                alert('Please enter a valid value.');
                return;
            }
        }

        healthData.push(reading);
        localStorage.setItem('healthData', JSON.stringify(healthData));
        healthInputForm.reset(); // Clear the form
        handleReadingTypeChange(); // Reset input fields visibility
        updateDashboard();
        renderHistory();
        alert('Health reading saved!');
    }

    /**
     * Updates the dashboard with the latest health readings and their statuses.
     */
    function updateDashboard() {
        const latestReadings = {};

        // Get the latest reading for each type
        healthData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by most recent
        healthData.forEach(reading => {
            if (!latestReadings[reading.type]) {
                latestReadings[reading.type] = reading;
            }
        });

        // Blood Pressure
        const latestBp = latestReadings.bloodPressure;
        if (latestBp) {
            bpDisplay.textContent = `${latestBp.systolic}/${latestBp.diastolic} mmHg`;
            const status = getBloodPressureStatus(latestBp.systolic, latestBp.diastolic);
            updateStatusDisplay(bpStatus, status);
        } else {
            bpDisplay.textContent = '--/-- mmHg';
            updateStatusDisplay(bpStatus, 'N/A');
        }

        // Heart Rate
        const latestHr = latestReadings.heartRate;
        if (latestHr) {
            hrDisplay.textContent = `${latestHr.value} bpm`;
            const status = getHeartRateStatus(latestHr.value);
            updateStatusDisplay(hrStatus, status);
        } else {
            hrDisplay.textContent = '-- bpm';
            updateStatusDisplay(hrStatus, 'N/A');
        }

        // Blood Sugar
        const latestBs = latestReadings.bloodSugar;
        if (latestBs) {
            bsDisplay.textContent = `${latestBs.value} mg/dL`;
            const status = getBloodSugarStatus(latestBs.value);
            updateStatusDisplay(bsStatus, status);
        } else {
            bsDisplay.textContent = '-- mg/dL';
            updateStatusDisplay(bsStatus, 'N/A');
        }

        // Temperature
        const latestTemp = latestReadings.temperature;
        if (latestTemp) {
            tempDisplay.textContent = `${latestTemp.value.toFixed(1)} °C`;
            const status = getTemperatureStatus(latestTemp.value);
            updateStatusDisplay(tempStatus, status);
        } else {
            tempDisplay.textContent = '-- °C';
            updateStatusDisplay(tempStatus, 'N/A');
        }

        generateInsights(latestReadings);
    }

    /**
     * Helper function to update the status display element with appropriate classes.
     * @param {HTMLElement} element - The span element for status display.
     * @param {string} statusText - The status text (e.g., 'Normal', 'Elevated', 'High', 'Low', 'N/A').
     */
    function updateStatusDisplay(element, statusText) {
        element.textContent = statusText;
        element.className = ''; // Clear existing classes
        element.classList.add(
            'status-' + statusText.toLowerCase().replace(/[^a-z0-9]/g, '') // Converts "N/A" to "na", "Blood Pressure" to "bloodpressure" etc.
        );
    }

    /**
     * Determines the status of blood pressure.
     * @param {number} systolic - Systolic blood pressure.
     * @param {number} diastolic - Diastolic blood pressure.
     * @returns {string} The blood pressure status.
     */
    function getBloodPressureStatus(systolic, diastolic) {
        if (systolic < 90 || diastolic < 60) return 'Low';
        if (systolic <= 120 && diastolic <= 80) return 'Normal';
        if ((systolic > 120 && systolic <= 129) && diastolic <= 80) return 'Elevated';
        if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) return 'High Blood Pressure (Stage 1)';
        if (systolic >= 140 || diastolic >= 90) return 'High Blood Pressure (Stage 2)';
        if (systolic > 180 || diastolic > 120) return 'Hypertensive Crisis'; // Seek immediate medical attention
        return 'N/A';
    }

    /**
     * Determines the status of heart rate.
     * @param {number} hr - Heart rate in bpm.
     * @returns {string} The heart rate status.
     */
    function getHeartRateStatus(hr) {
        // Normal resting heart rate for adults is 60-100 bpm
        if (hr < 60) return 'Low';
        if (hr >= 60 && hr <= 100) return 'Normal';
        if (hr > 100) return 'High';
        return 'N/A';
    }

    /**
     * Determines the status of blood sugar (fasting).
     * @param {number} bs - Blood sugar in mg/dL.
     * @returns {string} The blood sugar status.
     */
    function getBloodSugarStatus(bs) {
        // Fasting blood sugar levels
        if (bs < 70) return 'Low';
        if (bs >= 70 && bs <= 99) return 'Normal';
        if (bs >= 100 && bs <= 125) return 'Pre-diabetic';
        if (bs >= 126) return 'High';
        return 'N/A';
    }

    /**
     * Determines the status of body temperature.
     * @param {number} temp - Temperature in degrees Celsius.
     * @returns {string} The temperature status.
     */
    function getTemperatureStatus(temp) {
        // Normal body temperature is around 37°C (98.6°F)
        if (temp < 35.0) return 'Low'; // Hypothermia
        if (temp >= 35.0 && temp <= 37.5) return 'Normal';
        if (temp > 37.5) return 'High'; // Fever
        return 'N/A';
    }


    /**
     * Generates and displays health insights based on the latest readings.
     * @param {object} latestReadings - Object containing the latest readings of each type.
     */
    function generateInsights(latestReadings) {
        let insights = [];

        // Check for general data availability
        if (Object.keys(latestReadings).length === 0) {
            insightText.textContent = "No insights yet. Add more data!";
            return;
        }

        // Blood Pressure Insights
        const latestBp = latestReadings.bloodPressure;
        if (latestBp) {
            const bpStatusText = getBloodPressureStatus(latestBp.systolic, latestBp.diastolic);
            if (bpStatusText.includes('High')) {
                insights.push(`Your blood pressure is ${bpStatusText}. Consider lifestyle changes or consult a doctor.`);
            } else if (bpStatusText === 'Elevated') {
                insights.push(`Your blood pressure is Elevated. Focus on a healthy diet and regular exercise.`);
            } else if (bpStatusText === 'Low') {
                insights.push(`Your blood pressure is Low. Ensure adequate hydration and consult a doctor if you experience symptoms.`);
            }
        }

        // Heart Rate Insights
        const latestHr = latestReadings.heartRate;
        if (latestHr) {
            const hrStatusText = getHeartRateStatus(latestHr.value);
            if (hrStatusText === 'High') {
                insights.push(`Your heart rate is High (${latestHr.value} bpm). If persistent, consult a healthcare professional.`);
            } else if (hrStatusText === 'Low') {
                insights.push(`Your heart rate is Low (${latestHr.value} bpm). This could be normal for athletes, but consult a doctor if you have symptoms.`);
            }
        }

        // Blood Sugar Insights
        const latestBs = latestReadings.bloodSugar;
        if (latestBs) {
            const bsStatusText = getBloodSugarStatus(latestBs.value);
            if (bsStatusText.includes('High') || bsStatusText === 'Pre-diabetic') {
                insights.push(`Your blood sugar is ${bsStatusText}. Monitor your diet and consider medical advice.`);
            } else if (bsStatusText === 'Low') {
                insights.push(`Your blood sugar is Low. Ensure regular meals and consult a doctor if you feel symptoms of hypoglycemia.`);
            }
        }

        // Temperature Insights
        const latestTemp = latestReadings.temperature;
        if (latestTemp) {
            const tempStatusText = getTemperatureStatus(latestTemp.value);
            if (tempStatusText === 'High') {
                insights.push(`Your temperature is High (${latestTemp.value.toFixed(1)}°C), indicating a fever. Rest and consult a doctor if needed.`);
            } else if (tempStatusText === 'Low') {
                insights.push(`Your temperature is Low (${latestTemp.value.toFixed(1)}°C). If you feel unwell, seek medical advice.`);
            }
        }

        if (insights.length > 0) {
            insightText.innerHTML = insights.map(insight => `<li>${insight}</li>`).join('');
            insightText.style.listStyleType = 'disc'; // Add bullets to insights
            insightText.style.paddingLeft = '20px';
        } else {
            insightText.textContent = "All recent readings appear to be within normal ranges. Keep up the good work!";
            insightText.style.listStyleType = 'none';
            insightText.style.paddingLeft = '0';
        }
    }

    /**
     * Renders the health history list.
     */
    function renderHistory() {
        historyList.innerHTML = ''; // Clear current list

        // Sort by most recent first for display
        const sortedHealthData = [...healthData].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (sortedHealthData.length === 0) {
            historyList.innerHTML = '<li>No history yet. Add some readings!</li>';
            return;
        }

        sortedHealthData.forEach(reading => {
            const li = document.createElement('li');
            const date = new Date(reading.timestamp).toLocaleString();
            let readingText = '';

            switch (reading.type) {
                case 'bloodPressure':
                    readingText = `Blood Pressure: ${reading.systolic}/${reading.diastolic} mmHg`;
                    break;
                case 'heartRate':
                    readingText = `Heart Rate: ${reading.value} bpm`;
                    break;
                case 'bloodSugar':
                    readingText = `Blood Sugar: ${reading.value} mg/dL`;
                    break;
                case 'temperature':
                    readingText = `Temperature: ${reading.value.toFixed(1)} °C`;
                    break;
            }

            li.innerHTML = `
                <div>
                    <span>${date}</span> - <span>${readingText}</span>
                    ${reading.notes ? `<p class="history-notes">Notes: ${reading.notes}</p>` : ''}
                </div>
            `;
            historyList.appendChild(li);
        });
    }
});
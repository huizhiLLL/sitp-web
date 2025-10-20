document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const form = document.getElementById('prediction-form');
    const resetBtn = document.getElementById('reset-btn');
    const resultsCard = document.getElementById('results-card');
    const placeholderCard = document.getElementById('placeholder-card');
    
    // Slider value updates
    const metalContent = document.getElementById('metal-content');
    const metalContentValue = document.getElementById('metal-content-value');
    const humidity = document.getElementById('humidity');
    const humidityValue = document.getElementById('humidity-value');
    
    if (metalContent && metalContentValue) {
        metalContent.addEventListener('input', function() {
            metalContentValue.textContent = this.value + '%';
        });
    }
    
    if (humidity && humidityValue) {
        humidity.addEventListener('input', function() {
            humidityValue.textContent = this.value + '%';
        });
    }
    
    // Chart instance
    let performanceChart = null;
    
    // Form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const catalystType = document.getElementById('catalyst-type').value;
            const metalContentVal = document.getElementById('metal-content').value;
            const supportMaterial = document.getElementById('support-material').value;
            const surfaceArea = document.getElementById('surface-area').value;
            const particleSize = document.getElementById('particle-size').value;
            const temperature = document.getElementById('temperature').value;
            const humidityVal = document.getElementById('humidity').value;
            
            // Validate required fields
            if (!catalystType || !supportMaterial) {
                alert('Please fill in all required fields (marked with *)');
                return;
            }
            
            // Generate simulated predictions
            const predictions = generatePredictions(
                catalystType, 
                metalContentVal, 
                supportMaterial,
                surfaceArea,
                particleSize,
                temperature,
                humidityVal
            );
            
            // Display results
            displayResults(predictions);
        });
    }
    
    // Reset button
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            form.reset();
            metalContentValue.textContent = '20%';
            humidityValue.textContent = '100%';
            resultsCard.classList.add('hidden');
            placeholderCard.classList.remove('hidden');
            
            if (performanceChart) {
                performanceChart.destroy();
                performanceChart = null;
            }
        });
    }
    
    // Generate simulated predictions based on input parameters
    function generatePredictions(catalystType, metalContent, support, surfaceArea, particleSize, temp, humidity) {
        // Base values
        let massActivity = 0.15;
        let specificActivity = 0.25;
        let ecsa = 60;
        let stability = 75;
        
        // Adjust based on catalyst type
        switch(catalystType) {
            case 'pt-based':
                massActivity *= 1.0;
                specificActivity *= 1.0;
                break;
            case 'pt-alloy':
                massActivity *= 1.3;
                specificActivity *= 1.2;
                stability += 10;
                break;
            case 'non-pgm':
                massActivity *= 0.4;
                specificActivity *= 0.5;
                stability -= 15;
                break;
            case 'single-atom':
                massActivity *= 1.5;
                specificActivity *= 0.9;
                stability += 5;
                break;
        }
        
        // Adjust based on metal content
        const metalFactor = parseFloat(metalContent) / 20;
        massActivity *= (0.5 + metalFactor * 0.5);
        
        // Adjust based on support material
        switch(support) {
            case 'graphene':
                massActivity *= 1.15;
                stability += 8;
                break;
            case 'cnt':
                massActivity *= 1.1;
                stability += 5;
                break;
        }
        
        // Adjust based on surface area
        if (surfaceArea) {
            const areaFactor = parseFloat(surfaceArea) / 250;
            ecsa *= areaFactor;
            massActivity *= (0.8 + areaFactor * 0.2);
        }
        
        // Adjust based on particle size
        if (particleSize) {
            const sizeFactor = 3.5 / parseFloat(particleSize);
            ecsa *= sizeFactor;
            massActivity *= (0.9 + sizeFactor * 0.1);
        }
        
        // Add some randomness for realism
        massActivity *= (0.95 + Math.random() * 0.1);
        specificActivity *= (0.95 + Math.random() * 0.1);
        ecsa *= (0.95 + Math.random() * 0.1);
        stability *= (0.95 + Math.random() * 0.1);
        
        return {
            massActivity: massActivity.toFixed(3),
            specificActivity: specificActivity.toFixed(2),
            ecsa: ecsa.toFixed(1),
            stability: Math.min(stability, 95).toFixed(1)
        };
    }
    
    // Display prediction results
    function displayResults(predictions) {
        // Update metric values
        document.getElementById('mass-activity').textContent = predictions.massActivity;
        document.getElementById('specific-activity').textContent = predictions.specificActivity;
        document.getElementById('ecsa').textContent = predictions.ecsa;
        document.getElementById('stability').textContent = predictions.stability;
        
        // Show results card, hide placeholder
        resultsCard.classList.remove('hidden');
        placeholderCard.classList.add('hidden');
        
        // Create performance chart
        createPerformanceChart(predictions);
        
        // Scroll to results
        resultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Create Chart.js visualization
    function createPerformanceChart(predictions) {
        const ctx = document.getElementById('performance-chart');
        
        if (!ctx) return;
        
        // Destroy existing chart
        if (performanceChart) {
            performanceChart.destroy();
        }
        
        // Generate polarization curve data
        const voltageData = [];
        const currentData = [];
        
        for (let i = 0; i <= 10; i++) {
            const current = i * 0.1;
            const voltage = 1.0 - (current * 0.3) - (current * current * 0.15);
            currentData.push(current);
            voltageData.push(voltage);
        }
        
        performanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: currentData,
                datasets: [{
                    label: 'Predicted Polarization Curve',
                    data: voltageData,
                    borderColor: '#1a73e8',
                    backgroundColor: 'rgba(26, 115, 232, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Current Density (A/cm²)',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Cell Voltage (V)',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        min: 0,
                        max: 1.2,
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }
});

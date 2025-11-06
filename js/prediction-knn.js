/**
 * K-NN Predictor - Frontend Integration Script
 * Handles form submission, result display, and user interactions
 */

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initializing K-NN prediction page...');

    // DOM element references
    const form = document.getElementById('prediction-form');
    const resetBtn = document.getElementById('reset-btn');
    const resultsCard = document.getElementById('results-card');
    const placeholderCard = document.getElementById('placeholder-card');
    const messageBox = document.getElementById('message-box');
    
    // Input fields
    const inputMetal = document.getElementById('input-metal');
    const inputMof = document.getElementById('input-mof');
    const inputForm = document.getElementById('input-form');
    const inputLigand = document.getElementById('input-ligand');
    const inputAtm = document.getElementById('input-atm');
    const inputPyroTemp = document.getElementById('input-pyro-temp');
    const inputBet = document.getElementById('input-bet');
    const inputRpm = document.getElementById('input-rpm');
    const inputScanRate = document.getElementById('input-scan-rate');

    // Result display elements
    const resultValue = document.getElementById('half-wave-result');
    const similarityInfo = document.getElementById('similarity-info');
    const neighborsList = document.getElementById('neighbors-list');

    let predictor = null;
    let isInitialized = false;

    /**
     * Initialize Predictor
     */
    async function initializePredictor() {
        try {
            console.log('⏳ Loading K-NN Predictor...');
            
            // Create predictor instance
            predictor = new KNNPredictor();
            
            // Initialize (load CSV data)
            const success = await predictor.init();
            
            if (!success) {
                throw new Error('Predictor initialization failed');
            }

            isInitialized = true;
            console.log('✓ K-NN Predictor initialized successfully');
            
            // Enable form
            form.querySelector('button[type="submit"]').disabled = false;
            form.querySelector('button[type="submit"]').textContent = '🔮 Predict E_half';
            
            return true;

        } catch (error) {
            console.error('✗ Initialization failed:', error);
            alert('❌ Predictor initialization failed: ' + error.message);
            return false;
        }
    }

    /**
     * Validate Required Fields
     */
    function validateInputs() {
        const metal = inputMetal.value.trim();
        const mof = inputMof.value.trim();

        if (!metal) {
            alert('Please enter Active Metal');
            return false;
        }

        if (!mof) {
            alert('Please enter MOF Name');
            return false;
        }

        return true;
    }

    /**
     * Collect Form Data
     */
    function gatherFormData() {
        return {
            metal: inputMetal.value.trim(),
            mof: inputMof.value.trim(),
            form: inputForm.value || '',
            ligand: inputLigand.value.trim(),
            atm: inputAtm.value.trim(),
            'Materials_Structure.Pyrolysis_Temp_C': inputPyroTemp.value ? parseFloat(inputPyroTemp.value) : null,
            'Materials_Structure.BET_m2g': inputBet.value ? parseFloat(inputBet.value) : null,
            'Experimental_Conditions.Rotation_rpm': inputRpm.value ? parseFloat(inputRpm.value) : null,
            'Experimental_Conditions.Scan_Rate_mV_s': inputScanRate.value ? parseFloat(inputScanRate.value) : null
        };
    }

    /**
     * Display Prediction Results
     */
    function displayResults(result) {
        if (!result) {
            showError('Prediction failed: empty result');
            return;
        }

        // Display predicted value
        resultValue.textContent = result.E_half_V_predicted.toFixed(4) + ' V';

        // Display similarity information
        if (result.Top_K_Neighbors && result.Top_K_Neighbors.length > 0) {
            const topNeighbor = result.Top_K_Neighbors[0];
            // Similarity = 1 / (1 + distance), normalized to percentage
            const similarity = (1 / (1 + topNeighbor.Distance) * 100).toFixed(1);

            similarityInfo.innerHTML = `
                <p><span class="font-semibold">Nearest Neighbor Distance:</span> ${topNeighbor.Distance.toFixed(4)}</p>
                <p><span class="font-semibold">Similarity Score:</span> <span class="text-green-600 font-bold">${similarity}%</span></p>
                <p><span class="font-semibold">K Value:</span> 3</p>
            `;

            // Display neighbor samples
            neighborsList.innerHTML = result.Top_K_Neighbors.map((n, i) => `
                <div class="bg-white p-3 rounded border border-slate-200 hover:shadow-sm transition">
                    <div class="flex justify-between items-start mb-2">
                        <span class="font-semibold text-primary">Neighbor ${i+1}</span>
                        <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            Distance: ${n.Distance.toFixed(3)}
                        </span>
                    </div>
                    <p class="text-xs text-slate-600">
                        <span>E_half:</span>
                        <span class="font-mono font-semibold">${n.E_half_V.toFixed(4)} V</span>
                    </p>
                    <p class="text-xs text-slate-500 mt-1">Database Index #${n.Database_Index}</p>
                </div>
            `).join('');
        }

        // Display success message
        messageBox.className = 'bg-green-50 border-l-4 border-green-400 p-3 rounded text-sm';
        messageBox.innerHTML = `<p class="text-green-800"><strong>✓ Success:</strong> Prediction completed</p>`;

        // Show/hide cards
        resultsCard.classList.remove('hidden');
        placeholderCard.classList.add('hidden');

        // Smooth scroll to results
        setTimeout(() => {
            resultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }

    /**
     * Show Error
     */
    function showError(errorMsg) {
        resultValue.textContent = '❌ Error';
        
        messageBox.className = 'bg-red-50 border-l-4 border-red-400 p-3 rounded text-sm';
        messageBox.innerHTML = `<p class="text-red-800"><strong>✗ Error:</strong> ${errorMsg}</p>`;

        similarityInfo.innerHTML = '<p class="text-red-600 text-xs">Prediction failed</p>';
        neighborsList.innerHTML = '<p class="text-slate-500 text-xs">No neighbor data</p>';

        resultsCard.classList.remove('hidden');
        placeholderCard.classList.add('hidden');

        setTimeout(() => {
            resultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }

    /**
     * Form Submission Handler
     */
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!isInitialized) {
                alert('Predictor not initialized, please wait...');
                return;
            }

            // Validate inputs
            if (!validateInputs()) {
                return;
            }

            // Show loading status
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ Calculating...';

            try {
                // Collect form data
                const sample = gatherFormData();
                console.log('📊 Input sample:', sample);

                // Execute prediction
                const result = predictor.predict(sample, 3);
                console.log('🎯 Prediction result:', result);

                // Display results
                displayResults(result);

            } catch (error) {
                console.error('✗ Prediction error:', error);
                showError(error.message);
            } finally {
                // Restore button
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    /**
     * Reset Button
     */
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            form.reset();
            resultsCard.classList.add('hidden');
            placeholderCard.classList.remove('hidden');
            console.log('🔄 Form reset');
        });
    }

    /**
     * Initialize
     */
    await initializePredictor();
});


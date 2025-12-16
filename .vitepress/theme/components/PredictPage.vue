<template>
  <div class="predict-container">
    <header class="predict-header">
      <h1>Catalyst Prediction</h1>
      <p>Enter catalyst parameters to predict fuel cell performance using our ML-based model.</p>
    </header>

    <section class="input-section">
      <form @submit.prevent="handlePredict" class="predict-form">
        <div class="form-group">
          <label for="composition">Catalyst Composition</label>
          <input
            id="composition"
            v-model="inputParams.composition"
            type="text"
            placeholder="e.g., Pt/C, PtRu/C"
            :class="{ 'error': errors.composition }"
          />
          <span v-if="errors.composition" class="error-message">{{ errors.composition }}</span>
        </div>

        <div class="form-group">
          <label for="loadingAmount">Loading Amount (mg/cm²)</label>
          <input
            id="loadingAmount"
            v-model.number="inputParams.loadingAmount"
            type="number"
            step="0.01"
            placeholder="e.g., 0.4"
            :class="{ 'error': errors.loadingAmount }"
          />
          <span v-if="errors.loadingAmount" class="error-message">{{ errors.loadingAmount }}</span>
        </div>

        <div class="form-group">
          <label for="temperature">Temperature (°C)</label>
          <input
            id="temperature"
            v-model.number="inputParams.temperature"
            type="number"
            placeholder="e.g., 80"
            :class="{ 'error': errors.temperature }"
          />
          <span v-if="errors.temperature" class="error-message">{{ errors.temperature }}</span>
        </div>

        <div class="form-group">
          <label for="pressure">Pressure (atm)</label>
          <input
            id="pressure"
            v-model.number="inputParams.pressure"
            type="number"
            step="0.1"
            placeholder="e.g., 1.5"
            :class="{ 'error': errors.pressure }"
          />
          <span v-if="errors.pressure" class="error-message">{{ errors.pressure }}</span>
        </div>

        <div class="form-group">
          <label for="humidity">Humidity (%)</label>
          <input
            id="humidity"
            v-model.number="inputParams.humidity"
            type="number"
            placeholder="e.g., 75"
            :class="{ 'error': errors.humidity }"
          />
          <span v-if="errors.humidity" class="error-message">{{ errors.humidity }}</span>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-predict" :disabled="isLoading">
            {{ isLoading ? 'Predicting...' : 'Predict' }}
          </button>
          <button type="button" class="btn-reset" @click="resetForm" :disabled="isLoading">
            Reset
          </button>
        </div>

        <div v-if="errorMessage" class="error-banner">
          {{ errorMessage }}
        </div>
      </form>
    </section>

    <section v-if="predictionResult" class="result-section">
      <h2>Prediction Results</h2>
      <div class="result-grid">
        <div class="result-item">
          <span class="result-label">Predicted Efficiency</span>
          <span class="result-value">{{ predictionResult.efficiency }}%</span>
        </div>
        <div class="result-item">
          <span class="result-label">Model Confidence</span>
          <span class="result-value">{{ predictionResult.confidence }}%</span>
        </div>
        <div class="result-item full-width">
          <span class="result-label">Timestamp</span>
          <span class="result-value">{{ formatTimestamp(predictionResult.timestamp) }}</span>
        </div>
      </div>

      <div v-if="predictionResult.recommendations.length > 0" class="recommendations">
        <h3>Recommendations</h3>
        <ul>
          <li v-for="(rec, index) in predictionResult.recommendations" :key="index">
            {{ rec }}
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const inputParams = reactive({
  composition: '',
  loadingAmount: null,
  temperature: null,
  pressure: null,
  humidity: null
})

const predictionResult = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')
const errors = reactive({
  composition: '',
  loadingAmount: '',
  temperature: '',
  pressure: '',
  humidity: ''
})

function validateInput() {
  // Clear previous errors
  Object.keys(errors).forEach(key => errors[key] = '')
  errorMessage.value = ''
  
  let isValid = true

  // Validate composition
  if (!inputParams.composition || inputParams.composition.trim() === '') {
    errors.composition = 'Composition is required'
    isValid = false
  }

  // Validate loading amount
  if (inputParams.loadingAmount === null || inputParams.loadingAmount === '') {
    errors.loadingAmount = 'Loading amount is required'
    isValid = false
  } else if (inputParams.loadingAmount <= 0) {
    errors.loadingAmount = 'Loading amount must be greater than 0'
    isValid = false
  } else if (inputParams.loadingAmount > 10) {
    errors.loadingAmount = 'Loading amount must be less than or equal to 10 mg/cm²'
    isValid = false
  }

  // Validate temperature
  if (inputParams.temperature === null || inputParams.temperature === '') {
    errors.temperature = 'Temperature is required'
    isValid = false
  } else if (inputParams.temperature < -50 || inputParams.temperature > 200) {
    errors.temperature = 'Temperature must be between -50°C and 200°C'
    isValid = false
  }

  // Validate pressure
  if (inputParams.pressure === null || inputParams.pressure === '') {
    errors.pressure = 'Pressure is required'
    isValid = false
  } else if (inputParams.pressure <= 0) {
    errors.pressure = 'Pressure must be greater than 0'
    isValid = false
  } else if (inputParams.pressure > 10) {
    errors.pressure = 'Pressure must be less than or equal to 10 atm'
    isValid = false
  }

  // Validate humidity
  if (inputParams.humidity === null || inputParams.humidity === '') {
    errors.humidity = 'Humidity is required'
    isValid = false
  } else if (inputParams.humidity < 0 || inputParams.humidity > 100) {
    errors.humidity = 'Humidity must be between 0% and 100%'
    isValid = false
  }

  return isValid
}

function generateRecommendations(input) {
  const recommendations = []

  if (input.temperature < 60) {
    recommendations.push('Consider increasing temperature for better performance')
  } else if (input.temperature > 90) {
    recommendations.push('High temperature may reduce catalyst durability')
  }

  if (input.loadingAmount < 0.3) {
    recommendations.push('Low catalyst loading may limit performance')
  } else if (input.loadingAmount > 0.6) {
    recommendations.push('High loading may not provide proportional benefits')
  }

  if (input.humidity < 50) {
    recommendations.push('Low humidity may affect proton conductivity')
  } else if (input.humidity > 90) {
    recommendations.push('High humidity may cause flooding issues')
  }

  if (input.pressure < 1.0) {
    recommendations.push('Consider increasing pressure for better oxygen availability')
  }

  return recommendations
}

function mockPredict(input) {
  // Simple calculation based on inputs
  const tempFactor = Math.max(0, Math.min(1, (input.temperature - 20) / 80))
  const pressureFactor = Math.min(1, input.pressure / 3)
  const humidityFactor = Math.max(0, Math.min(1, input.humidity / 100))
  const loadingFactor = Math.min(1, input.loadingAmount / 0.5)
  
  const efficiency = 40 + (tempFactor * 25) + (pressureFactor * 15) + (humidityFactor * 10) + (loadingFactor * 5)
  const confidence = 75 + Math.random() * 20 // 75-95%
  
  return {
    efficiency: Math.min(95, efficiency).toFixed(2),
    confidence: confidence.toFixed(2),
    recommendations: generateRecommendations(input),
    timestamp: new Date()
  }
}

async function handlePredict() {
  if (!validateInput()) {
    errorMessage.value = 'Please fix the errors above before predicting'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  predictionResult.value = null

  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    predictionResult.value = mockPredict(inputParams)
  } catch (error) {
    errorMessage.value = 'An error occurred during prediction. Please try again.'
  } finally {
    isLoading.value = false
  }
}

function resetForm() {
  inputParams.composition = ''
  inputParams.loadingAmount = null
  inputParams.temperature = null
  inputParams.pressure = null
  inputParams.humidity = null
  predictionResult.value = null
  errorMessage.value = ''
  Object.keys(errors).forEach(key => errors[key] = '')
}

function formatTimestamp(date) {
  return new Date(date).toLocaleString()
}
</script>

<style scoped>
.predict-container {
  max-width: var(--vp-layout-max-width);
  margin: 0 auto;
  padding: 24px;
}

.predict-header {
  margin-bottom: 32px;
}

.predict-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 12px;
}

.predict-header p {
  font-size: 1.125rem;
  color: var(--vp-c-text-2);
}

.input-section {
  margin-bottom: 32px;
}

.predict-form {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.form-group input.error {
  border-color: var(--vp-c-danger-1);
}

.error-message {
  display: block;
  color: var(--vp-c-danger-1);
  font-size: 0.875rem;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-predict,
.btn-reset {
  padding: 10px 24px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-predict {
  background: var(--vp-c-brand-1);
  color: var(--vp-c-bg);
}

.btn-predict:hover:not(:disabled) {
  background: var(--vp-c-brand-2);
}

.btn-predict:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-reset {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

.btn-reset:hover:not(:disabled) {
  background: var(--vp-c-bg-mute);
}

.btn-reset:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-banner {
  margin-top: 16px;
  padding: 12px;
  background: var(--vp-c-danger-soft);
  border: 1px solid var(--vp-c-danger-1);
  border-radius: 4px;
  color: var(--vp-c-danger-1);
}

.result-section {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 24px;
}

.result-section h2 {
  font-size: 1.75rem;
  color: var(--vp-c-text-1);
  margin-bottom: 20px;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.result-item {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-item.full-width {
  grid-column: 1 / -1;
}

.result-label {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  font-weight: 500;
}

.result-value {
  font-size: 1.5rem;
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

.recommendations {
  margin-top: 24px;
}

.recommendations h3 {
  font-size: 1.25rem;
  color: var(--vp-c-text-1);
  margin-bottom: 12px;
}

.recommendations ul {
  list-style: none;
  padding: 0;
}

.recommendations li {
  padding: 10px 12px;
  background: var(--vp-c-bg);
  border-left: 3px solid var(--vp-c-brand-1);
  margin-bottom: 8px;
  border-radius: 4px;
  color: var(--vp-c-text-1);
}

@media (max-width: 768px) {
  .predict-container {
    padding: 16px;
  }

  .predict-header h1 {
    font-size: 2rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-predict,
  .btn-reset {
    width: 100%;
  }

  .result-grid {
    grid-template-columns: 1fr;
  }
}
</style>

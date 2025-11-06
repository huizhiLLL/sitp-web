/**
 * K-NN Half-Wave Potential Predictor
 * Converted from Python: Similarity-based K-Nearest Neighbor Prediction Engine
 * 
 * Data Source: date/data1.csv (54 samples)
 * Features: 9 features (3 categorical + 5 numerical + 1 physical property)
 */

class KNNPredictor {
  constructor() {
    this.knownData = [];
    this.stats = {};
    this.isInitialized = false;

    // Weight configuration
    this.WEIGHTS = {
      metal: 1.5,
      mof: 1.2,
      form: 1.0,
      ligand: 0.8,
      atm: 0.7,
      pyro_temp: 2.0,
      bet: 1.5,
      rpm: 0.8,
      scan_rate: 0.5
    };

    // Ligand alias mapping table
    this.LIGAND_ALIASES = {
      '2-methylimidazole': '2-mi',
      'mim': '2-mi',
      '2-mim': '2-mi',
      '2-methylimidazolate': '2-mi',
      '1,4-benzenedicarboxylate': 'bdc',
      'bdc': 'bdc',
      '1,3,5-trimesic acid (h3btc)': 'btc',
      'btc': 'btc',
      '2-aminoterephthalic acid': 'nh2-bdc',
      '6-chloropurine': '6-cp',
      '2-aminothiazole': '2-atz'
    };

    // Known MOF names
    this.KNOWN_MOFS = [
      'mof-5', 'hkust-1', 'mil-101', 'nh2-mil-101', 'gt-18',
      'zn/fe-mof', 'fe-zif8', 'cozn', 'zif-zn-co', 'zif'
    ];

    this.NUM_COLS = [
      'Materials_Structure.Pyrolysis_Temp_C',
      'Materials_Structure.BET_m2g',
      'Experimental_Conditions.Rotation_rpm',
      'Experimental_Conditions.Scan_Rate_mV_s'
    ];

    this.NUM_COL_KEYS = ['pyro_temp', 'bet', 'rpm', 'scan_rate'];

    this.TARGET_COL = 'Electrochemical_Performance.E_half_V_vs_RHE';
  }

  /**
   * Initialize - Load and preprocess CSV data
   */
  async init() {
    console.log('🔄 Initializing K-NN Predictor...');
    try {
      const csv = await this.loadCSV('date/data1.csv');
      this.knownData = this.parseCSV(csv);
      
      // Filter valid data (E_half_V not empty)
      this.knownData = this.knownData.filter(row => {
        const val = this.parseValue(row[this.TARGET_COL]);
        return val !== null;
      });

      console.log(`✓ Loaded ${this.knownData.length} valid samples`);

      // Calculate statistics (for numerical similarity)
      this.calculateStats();
      
      this.isInitialized = true;
      console.log('✓ K-NN Predictor initialized successfully');
      return true;
    } catch (error) {
      console.error('✗ Initialization failed:', error);
      return false;
    }
  }

  /**
   * Load CSV file
   */
  async loadCSV(path) {
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (error) {
      console.error(`✗ Failed to load CSV: ${path}`, error);
      throw error;
    }
  }

  /**
   * Parse CSV text into array of objects
   */
  parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = this.parseCSVLine(lines[0]);
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = this.parseCSVLine(lines[i]);
      if (values.length !== headers.length) continue;

      const row = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx];
      });
      data.push(row);
    }

    return data;
  }

  /**
   * Parse CSV line (handle quotes and special characters)
   */
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  /**
   * Convert value to number, handle multiple values
   */
  parseValue(val) {
    if (!val || val === 'NAN' || val === 'NONE' || val === '') return null;

    // Convert to string if it's a number
    const strVal = String(val);

    // Handle array string format "['0.830', '0.920']"
    if (strVal.includes('[')) {
      const matches = strVal.match(/[\d.]+/g);
      if (matches && matches.length > 0) {
        return parseFloat(matches[0]); // take first value
      }
    }

    const num = parseFloat(strVal);
    return isNaN(num) ? null : num;
  }

  /**
   * Calculate statistics for numerical features (mean, standard deviation)
   */
  calculateStats() {
    this.NUM_COLS.forEach((col, idx) => {
      const values = this.knownData
        .map(row => this.parseValue(row[col]))
        .filter(v => v !== null);

      if (values.length === 0) {
        this.stats[this.NUM_COL_KEYS[idx]] = { mean: 0, std: 1 };
        return;
      }

      const mean = values.reduce((a, b) => a + b) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      const std = Math.sqrt(variance) || 1; // prevent 0

      this.stats[this.NUM_COL_KEYS[idx]] = { mean, std };
    });

    console.log('📊 Statistics calculated:', this.stats);
  }

  /**
   * Active Metal Similarity (Jaccard similarity)
   */
  activeMetalSimilarity(metal1, metal2) {
    if (!metal1 || !metal2) return 0.0;

    const normalize = (s) => {
      return new Set(
        s.split(/[,\s]+/)
          .map(x => x.trim().toLowerCase())
          .filter(x => x)
      );
    };

    const set1 = normalize(metal1);
    const set2 = normalize(metal2);

    if (set1.size === 0 || set2.size === 0) return 0.0;

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  /**
   * Extract keywords from MOF name
   */
  extractMofKeywords(text) {
    if (!text) return new Set();

    const lower = text.toLowerCase();
    const keywords = new Set();

    // Exact matching
    if (lower.includes('zif-8')) keywords.add('zif-8');
    if (lower.includes('zif-67')) keywords.add('zif-67');
    if (lower.includes('zif') && !lower.includes('zif-8') && !lower.includes('zif-67')) {
      keywords.add('zif');
    }

    // Known MOFs
    this.KNOWN_MOFS.forEach(mof => {
      if (lower.includes(mof)) keywords.add(mof);
    });

    // Special keywords
    if (lower.includes('bimetallic')) keywords.add('bimetallic');
    if (lower.includes('cozn') || lower.includes('zn-co')) keywords.add('cozn');

    return keywords;
  }

  /**
   * MOF Name Similarity
   */
  mofNameSimilarity(mof1, mof2) {
    if (!mof1 || !mof2) return 0.0;

    const s1 = mof1.toLowerCase();
    const s2 = mof2.toLowerCase();

    // Identical
    if (s1 === s2) return 1.0;

    const k1 = this.extractMofKeywords(s1);
    const k2 = this.extractMofKeywords(s2);

    if (k1.size === 0 || k2.size === 0) return 0.0;

    const intersection = new Set([...k1].filter(x => k2.has(x)));
    const union = new Set([...k1, ...k2]);
    let jaccard = intersection.size / union.size;

    // Reward mechanism
    let bonus = 0.0;
    if (k1.has('zif-8') && k2.has('zif-8')) bonus += 0.3;
    if (k1.has('zif-67') && k2.has('zif-67')) bonus += 0.3;

    return Math.min(1.0, jaccard + bonus);
  }

  /**
   * Extract set from form string
   */
  extractFormSet(s) {
    if (!s) return new Set();

    const lower = s.toLowerCase()
      .replace(/and/g, ',')
      .replace(/&/g, ',');

    const parts = lower.split(/[,\s]+/)
      .map(p => p.trim())
      .filter(p => p);

    const forms = new Set();
    parts.forEach(p => {
      if (['sa', 'single-atom', 'single atom'].includes(p)) forms.add('sa');
      else if (['cluster', 'clusters'].includes(p)) forms.add('cluster');
      else if (['dual-atom', 'dual atom', 'dual'].includes(p)) forms.add('sa');
    });

    return forms;
  }

  /**
   * Infer main form (if missing)
   */
  inferMainForm(metal, form) {
    if (!form || form === 'NAN' || form === '') {
      if (metal && metal.toLowerCase().includes('pt')) {
        return 'Cluster';
      }
      return 'SA';
    }
    return form;
  }

  /**
   * Main Form Similarity
   */
  mainFormSimilarity(form1, form2) {
    if (form1.size === 0 || form2.size === 0) return 0.0;

    const intersection = new Set([...form1].filter(x => form2.has(x)));
    const union = new Set([...form1, ...form2]);
    let jaccard = intersection.size / union.size;

    if (form1.has('sa') && form2.has('sa')) {
      jaccard = Math.min(1.0, jaccard + 0.2);
    }

    return jaccard;
  }

  /**
   * Extract set from ligand string
   */
  extractLigandSet(s) {
    if (!s) return new Set();

    const lower = s.toLowerCase();
    const parts = lower.split(/[,&+]/)
      .map(p => p.trim())
      .filter(p => p);

    const ligands = new Set();
    parts.forEach(p => {
      // Direct mapping
      if (this.LIGAND_ALIASES[p]) {
        ligands.add(this.LIGAND_ALIASES[p]);
        return;
      }

      // Fuzzy matching
      if (p.includes('2-methylimidazole') || p.includes('mim')) {
        ligands.add('2-mi');
      } else if (p.includes('benzenedicarboxylate')) {
        ligands.add('bdc');
      } else if (p.includes('trimesic')) {
        ligands.add('btc');
      } else if (p.includes('aminoterephthalic')) {
        ligands.add('nh2-bdc');
      } else if (p.includes('chloropurine')) {
        ligands.add('6-cp');
      } else if (p.includes('aminothiazole')) {
        ligands.add('2-atz');
      }
    });

    return ligands;
  }

  /**
   * Ligand Similarity
   */
  ligandSimilarity(lig1, lig2) {
    if (!lig1 || !lig2) return 0.0;

    const set1 = this.extractLigandSet(lig1);
    const set2 = this.extractLigandSet(lig2);

    if (set1.size === 0 || set2.size === 0) return 0.0;

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    let jaccard = intersection.size / union.size;

    if (set1.has('2-mi') && set2.has('2-mi')) {
      jaccard = Math.min(1.0, jaccard + 0.3);
    }

    return jaccard;
  }

  /**
   * Extract atmosphere features
   */
  extractAtmosphereFeatures(s) {
    if (!s) return { base: null, additive: null, sequence: false, special: null };

    const lower = s.toLowerCase().trim();
    const features = {
      base: null,
      additive: null,
      sequence: lower.includes('then') || lower.includes('/'),
      special: null
    };

    const gases = lower
      .replace(/then/g, ',')
      .split(/[,&+]/)
      .map(g => g.trim().split()[0])
      .filter(g => g);

    let main = null;
    gases.forEach(g => {
      if (['ar', 'n2'].includes(g)) main = g;
      else if (['h2', 'nh3', 'co2'].includes(g)) features.additive = g;
      else if (g.includes('h2')) features.additive = 'h2';
      else if (g.includes('nh3')) features.additive = 'nh3';
    });

    features.base = main || 'unknown';
    if (lower.includes('moist')) features.special = 'moist';
    if (lower.includes('co2')) features.special = 'co2';

    return features;
  }

  /**
   * Atmosphere Similarity
   */
  atmosphereSimilarity(atm1, atm2) {
    if (!atm1 || !atm2) return 0.0;

    const f1 = this.extractAtmosphereFeatures(atm1);
    const f2 = this.extractAtmosphereFeatures(atm2);

    let score = 0.0;
    if (f1.base === f2.base) score += 0.5;
    if (f1.additive === f2.additive) score += 0.3;
    if (f1.sequence === f2.sequence) score += 0.1;
    if (f1.special === f2.special) score += 0.1;

    return score;
  }

  /**
   * Numeric Similarity (Z-score + exponential decay)
   */
  numericSimilarity(val1, val2, key) {
    const v1 = this.parseValue(val1);
    const v2 = this.parseValue(val2);

    if (v1 === null || v2 === null) return 0.0;

    const { mean, std } = this.stats[key];
    const z1 = (v1 - mean) / std;
    const z2 = (v2 - mean) / std;

    return Math.exp(-Math.abs(z1 - z2));
  }

  /**
   * Calculate total distance (sum of weighted distances)
   */
  calculateDistance(newSample, refRow) {
    let d = 0.0;

    // Categorical features
    d += this.WEIGHTS.metal * (1 - this.activeMetalSimilarity(
      newSample.metal,
      refRow['Materials_Structure.Active_Metal']
    ));

    d += this.WEIGHTS.mof * (1 - this.mofNameSimilarity(
      newSample.mof,
      refRow['Materials_Structure.MOF_Name']
    ));

    const form1 = this.extractFormSet(
      this.inferMainForm(newSample.metal, newSample.form)
    );
    const form2 = this.extractFormSet(
      this.inferMainForm(
        refRow['Materials_Structure.Active_Metal'],
        refRow['Materials_Structure.Main_Form_SA_or_Cluster']
      )
    );

    d += this.WEIGHTS.form * (1 - this.mainFormSimilarity(form1, form2));

    d += this.WEIGHTS.ligand * (1 - this.ligandSimilarity(
      newSample.ligand,
      refRow['Materials_Structure.Ligand_Type']
    ));

    d += this.WEIGHTS.atm * (1 - this.atmosphereSimilarity(
      newSample.atm,
      refRow['Materials_Structure.Pyrolysis_Atmosphere']
    ));

    // Numerical features
    for (let i = 0; i < this.NUM_COLS.length; i++) {
      const col = this.NUM_COLS[i];
      const key = this.NUM_COL_KEYS[i];
      const sim = this.numericSimilarity(
        newSample[col],
        refRow[col],
        key
      );
      d += this.WEIGHTS[key] * (1 - sim);
    }

    return d;
  }

  /**
   * Predict - K-NN Core
   */
  predict(newSample, k = 3) {
    if (!this.isInitialized) {
      console.error('✗ Predictor not initialized');
      return null;
    }

    // Calculate all distances
    const distances = this.knownData.map((row, idx) => {
      const d = this.calculateDistance(newSample, row);
      const eHalf = this.parseValue(row[this.TARGET_COL]);
      return { distance: d, value: eHalf, index: idx };
    });

    // Sort and get Top-K
    distances.sort((a, b) => a.distance - b.distance);
    const topK = distances.slice(0, k);

    if (topK.length === 0) {
      console.error('✗ No valid neighbors');
      return null;
    }

    // Take the E_half value from the nearest neighbor (K=1)
    const nearestNeighbor = topK[0];
    const prediction = nearestNeighbor.value;

    return {
      E_half_V_predicted: Math.round(prediction * 10000) / 10000,
      Top_K_Neighbors: topK.map(d => ({
        Database_Index: d.index,
        E_half_V: Math.round(d.value * 10000) / 10000,
        Distance: Math.round(d.distance * 1000) / 1000,
        Similarity: Math.round((1 - d.distance) * 1000) / 1000
      }))
    };
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KNNPredictor;
}


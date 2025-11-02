/**
 * Data Loader - 加载和解析CSV数据文件
 * 从date文件夹加载两张表：mass_activity_summary 和 E1_2_summary
 */

class DataLoader {
    constructor() {
        this.massActivityData = null;
        this.halfWaveData = null;
        this.isLoaded = false;
    }

    /**
     * 初始化 - 加载所有数据
     */
    async init() {
        try {
            console.log('开始加载数据...');
            await Promise.all([
                this.loadMassActivityData(),
                this.loadHalfWaveData()
            ]);
            this.isLoaded = true;
            console.log('✓ 数据加载完成');
            return true;
        } catch (error) {
            console.error('✗ 数据加载失败:', error);
            this.isLoaded = false;
            return false;
        }
    }

    /**
     * 加载 mass_activity CSV
     */
    async loadMassActivityData() {
        const csvPath = 'date/mass_activity_summary_converted.csv';
        const csv = await this.fetchCSV(csvPath);
        this.massActivityData = this.parseCSV(csv);
        console.log(`✓ 加载mass_activity数据: ${this.massActivityData.length}条记录`);
    }

    /**
     * 加载 half_wave CSV
     */
    async loadHalfWaveData() {
        const csvPath = 'date/E1_2_summary.csv';
        const csv = await this.fetchCSV(csvPath);
        this.halfWaveData = this.parseCSV(csv);
        console.log(`✓ 加载half_wave数据: ${this.halfWaveData.length}条记录`);
    }

    /**
     * 获取CSV文件
     */
    async fetchCSV(path) {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`无法加载CSV: ${path} (HTTP ${response.status})`);
        }
        return await response.text();
    }

    /**
     * 解析CSV文本为对象数组
     */
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length < 1) return [];

        // 获取表头
        const headers = lines[0].split(',').map(h => h.trim());

        // 解析数据行
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim().length === 0) continue;

            const values = this.parseCSVLine(lines[i]);
            if (values.length === headers.length) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index].trim();
                });
                data.push(row);
            }
        }

        return data;
    }

    /**
     * 解析CSV行 - 处理引号和逗号
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
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);

        return result;
    }

    /**
     * 获取mass_activity数据
     */
    getMassActivityData() {
        return this.massActivityData || [];
    }

    /**
     * 获取half_wave数据
     */
    getHalfWaveData() {
        return this.halfWaveData || [];
    }
}

// 创建全局实例
const dataLoader = new DataLoader();

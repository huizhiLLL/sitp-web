/**
 * Algorithm - 催化剂性能预测算法
 * 映射逻辑: mass_activity + material_type → source_pdf → half_wave_potential
 * 转换自: date/算法.ipynb
 */

class PredictionAlgorithm {
    constructor(massActivityData, halfWaveData) {
        this.massActivityData = massActivityData || [];
        this.halfWaveData = halfWaveData || [];
    }

    /**
     * 检查字符串是否包含目标元素
     * @param {string} cell - 单元格值
     * @param {string} target - 目标元素（如 'Co', 'Fe'）
     * @returns {boolean}
     */
    containsElement(cell, target) {
        if (!cell || cell === 'NAN' || cell === 'NONE' || cell === '') {
            return false;
        }
        return cell.toUpperCase().includes(target.toUpperCase());
    }

    /**
     * 解析浮点数
     * @param {string|number} value - 值
     * @returns {number|NaN}
     */
    parseFloat(value) {
        if (!value || value === 'NAN' || value === 'NONE') {
            return NaN;
        }

        const numStr = String(value).replace(/,/g, '');
        const nums = numStr.match(/[-+]?\d*\.?\d+(?:[Ee][-+]?\d+)?/);

        return nums ? parseFloat(nums[0]) : NaN;
    }

    /**
     * 算法1: 根据mass_activity找到最接近的source_pdf
     * @param {boolean} isPt - 是否为Pt材料
     * @param {number} massActivity - 质量活性值
     * @param {string} metalElements - 金属元素（Co 或 Fe，当 isPt=false 时需要）
     * @returns {string|null} source_pdf 路径
     */
    findClosestMassPdf(isPt, massActivity, metalElements = null) {
        let candidates = [];

        if (isPt) {
            // Pt材料：筛选 Pt == 1
            candidates = this.massActivityData.filter(row => {
                const ptValue = parseInt(row['Pt']) || 0;
                return ptValue === 1;
            });
            console.log(`   ✓ 找到 ${candidates.length} 条Pt记录`);
        } else {
            // 非Pt材料：筛选 PT/NOTPT == NOTPT 且包含指定金属元素
            if (!['Co', 'Fe'].includes(metalElements)) {
                throw new Error(`metal_elements 必须是 'Co' 或 'Fe'，得到: ${metalElements}`);
            }

            candidates = this.massActivityData.filter(row => {
                const ptNotPt = (row['PT/NOTPT'] || '').toUpperCase();
                const metalMatch = this.containsElement(row['Metal elements'], metalElements);
                return ptNotPt === 'NOTPT' && metalMatch;
            });
            console.log(`   ✓ 找到 ${candidates.length} 条${metalElements}非Pt记录`);
        }

        // 过滤有效的mass_activity值
        const validCandidates = candidates
            .map(row => ({
                ...row,
                mass_activity_numeric: this.parseFloat(row['mass_activity_A_per_mg'])
            }))
            .filter(row => !isNaN(row.mass_activity_numeric));

        console.log(`   ✓ 有效候选: ${validCandidates.length} 条`);

        if (validCandidates.length === 0) {
            return null;
        }

        // 找到差值最小的行
        let closestRow = validCandidates[0];
        let minDiff = Math.abs(validCandidates[0].mass_activity_numeric - massActivity);

        for (let i = 1; i < validCandidates.length; i++) {
            const diff = Math.abs(validCandidates[i].mass_activity_numeric - massActivity);
            if (diff < minDiff) {
                minDiff = diff;
                closestRow = validCandidates[i];
            }
        }

        console.log(`   ✓ 最接近的值: ${closestRow.mass_activity_numeric} A/mg (差值: ${minDiff.toFixed(6)})`);

        return closestRow['source_pdf'] || null;
    }

    /**
     * 算法3: 根据PDF来源获取对应的half_wave_potential
     * @param {string} pdfPath - PDF文件路径
     * @returns {number|null} half_wave_potential值
     */
    getHalfWaveFromPdf(pdfPath) {
        // 尝试精确匹配
        let matches = this.halfWaveData.filter(row => row['source_pdf'] === pdfPath);

        // 如果没有精确匹配，尝试规范化路径（处理斜杠差异）
        if (matches.length === 0) {
            const normalizedPath = pdfPath.replace(/\\/g, '/').toLowerCase();
            matches = this.halfWaveData.filter(row => {
                const normalizedRowPath = row['source_pdf'].replace(/\\/g, '/').toLowerCase();
                return normalizedRowPath === normalizedPath;
            });
        }

        if (matches.length === 0) {
            console.warn(`❌ 未找到PDF的half_wave数据: ${pdfPath}`);
            console.warn(`📊 可用的PDF列表 (前10个):`, this.halfWaveData.slice(0, 10).map(r => r['source_pdf']));
            return null;
        }

        const halfWaveStr = matches[0]['half_wave_potential_v'];
        const halfWaveNum = this.parseFloat(halfWaveStr);

        if (isNaN(halfWaveNum)) {
            console.warn(`⚠️ 无法解析half_wave值: ${halfWaveStr} from ${pdfPath}`);
            return null;
        }

        console.log(`✓ 找到half_wave数据: ${halfWaveNum}V from ${pdfPath}`);
        return halfWaveNum;
    }

    /**
     * 主函数: mass_activity → half_wave_potential
     * @param {boolean} isPt - 是否为Pt材料
     * @param {number} massActivity - 质量活性值 (A/mg)
     * @param {string} metalElements - 金属元素（仅当 isPt=false 时使用）
     * @returns {object} 预测结果
     */
    predictHalfWave(isPt, massActivity, metalElements = null) {
        const result = {
            success: false,
            halfWavePotential: null,
            sourcePdf: null,
            massActivity: massActivity,
            isPt: isPt,
            metalElements: metalElements,
            error: null,
            closestMatch: {
                massActivity: null,
                diff: null
            }
        };

        try {
            console.log(`\n🔍 开始预测...`);
            console.log(`   材料类型: ${isPt ? 'Pt' : metalElements}`);
            console.log(`   Mass Activity: ${massActivity} A/mg`);

            // 步骤1: 找最接近的PDF
            console.log(`\n📍 步骤1: 寻找最接近的mass_activity...`);
            const pdf = this.findClosestMassPdf(isPt, massActivity, metalElements);

            if (!pdf) {
                result.error = '未找到匹配的mass_activity数据';
                console.error(`❌ ${result.error}`);
                return result;
            }

            result.sourcePdf = pdf;
            console.log(`✓ 找到PDF源: ${pdf}`);

            // 步骤2: 从PDF获取half_wave
            console.log(`\n🔗 步骤2: 从PDF获取half_wave_potential...`);
            const halfWave = this.getHalfWaveFromPdf(pdf);

            if (halfWave === null) {
                result.error = 'PDF源中未找到half_wave_potential数据';
                console.error(`❌ ${result.error}`);
                console.log(`📌 请检查CSV中的PDF路径格式是否一致`);
                return result;
            }

            result.halfWavePotential = halfWave;
            result.success = true;
            console.log(`✓ 预测成功: ${halfWave}V\n`);

            // 记录最接近的mass_activity值（用于显示）
            const candidates = this.findCandidates(isPt, metalElements);
            const closest = this.findClosestCandidate(candidates, massActivity);
            if (closest) {
                result.closestMatch.massActivity = closest.mass_activity_numeric;
                result.closestMatch.diff = Math.abs(closest.mass_activity_numeric - massActivity);
            }

        } catch (error) {
            result.error = error.message;
            console.error(`❌ 异常: ${error.message}`);
        }

        return result;
    }

    /**
     * 辅助函数: 获取候选项
     */
    findCandidates(isPt, metalElements) {
        let candidates = [];

        if (isPt) {
            candidates = this.massActivityData.filter(row => {
                const ptValue = parseInt(row['Pt']) || 0;
                return ptValue === 1;
            });
        } else {
            candidates = this.massActivityData.filter(row => {
                const ptNotPt = (row['PT/NOTPT'] || '').toUpperCase();
                const metalMatch = this.containsElement(row['Metal elements'], metalElements);
                return ptNotPt === 'NOTPT' && metalMatch;
            });
        }

        return candidates
            .map(row => ({
                ...row,
                mass_activity_numeric: this.parseFloat(row['mass_activity_A_per_mg'])
            }))
            .filter(row => !isNaN(row.mass_activity_numeric));
    }

    /**
     * 辅助函数: 找最接近的候选项
     */
    findClosestCandidate(candidates, massActivity) {
        if (candidates.length === 0) return null;

        let closest = candidates[0];
        let minDiff = Math.abs(closest.mass_activity_numeric - massActivity);

        for (let i = 1; i < candidates.length; i++) {
            const diff = Math.abs(candidates[i].mass_activity_numeric - massActivity);
            if (diff < minDiff) {
                minDiff = diff;
                closest = candidates[i];
            }
        }

        return closest;
    }
}

// 创建全局实例（在data-loader初始化后使用）
let predictionAlgorithm = null;

function initAlgorithm(massActivityData, halfWaveData) {
    predictionAlgorithm = new PredictionAlgorithm(massActivityData, halfWaveData);
    console.log('✓ 预测算法已初始化');
}

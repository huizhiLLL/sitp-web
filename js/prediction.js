document.addEventListener('DOMContentLoaded', async function() {
    // 获取DOM元素
    const form = document.getElementById('prediction-form');
    const resetBtn = document.getElementById('reset-btn');
    const resultsCard = document.getElementById('results-card');
    const placeholderCard = document.getElementById('placeholder-card');
    
    // 铂基选择单选按钮
    const ptYesRadio = document.getElementById('pt-yes');
    const ptNoRadio = document.getElementById('pt-no');
    const metalElementsSection = document.getElementById('metal-elements-section');
    const metalElementsSelect = document.getElementById('metal-elements');
    
    let dataReady = false;

    /**
     * 初始化 - 加载所有数据和算法
     */
    async function initializeApp() {
        try {
            // 显示加载状态
            if (form) {
                form.querySelector('button[type="submit"]').disabled = true;
                form.querySelector('button[type="submit"]').textContent = 'Loading data...';
            }

            // 加载数据
            const loaded = await dataLoader.init();
            if (!loaded) {
                throw new Error('Failed to load data');
            }

            // 初始化算法
            initAlgorithm(
                dataLoader.getMassActivityData(),
                dataLoader.getHalfWaveData()
            );

            dataReady = true;

            // 恢复按钮
            if (form) {
                form.querySelector('button[type="submit"]').disabled = false;
                form.querySelector('button[type="submit"]').textContent = 'Predict Half-Wave Potential';
            }

            console.log('✓ 应用初始化完成，数据已就绪');

        } catch (error) {
            console.error('✗ 初始化失败:', error);
            alert('Failed to load application data. Please refresh the page.');
        }
    }

    // 启动初始化
    await initializeApp();

    /**
     * 监听铂基选择变化，动态显示/隐藏金属元素选择
     */
    function setupPlatinumToggle() {
        const updateMetalElementsVisibility = () => {
            if (ptNoRadio.checked) {
                // 非铂基：显示金属元素输入
                metalElementsSection.classList.remove('hidden');
                metalElementsSelect.required = true;
            } else if (ptYesRadio.checked) {
                // 铂基：隐藏金属元素输入，清空输入
                metalElementsSection.classList.add('hidden');
                metalElementsSelect.value = '';
                metalElementsSelect.required = false;
            }
        };

        ptYesRadio.addEventListener('change', updateMetalElementsVisibility);
        ptNoRadio.addEventListener('change', updateMetalElementsVisibility);
    }

    setupPlatinumToggle();

    /**
     * 表单提交处理
     */
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            if (!dataReady) {
                alert('Data is still loading. Please try again.');
                return;
            }

            // 获取铂基选择
            const isPt = ptYesRadio.checked;
            const massActivityInput = document.getElementById('mass-activity-input').value;
            let metalElements = null;

            // 验证必填字段
            if (!massActivityInput) {
                alert('Please enter Mass Activity value');
                return;
            }

            if (!isPt && !metalElementsSelect.value) {
                alert('Please select a metal element for Non-Pt catalyst');
                return;
            }

            // 获取金属元素并验证
            if (!isPt) {
                metalElements = metalElementsSelect.value.trim().toUpperCase();
                
                // 验证金属元素只能是Fe或Co
                if (metalElements !== 'FE' && metalElements !== 'CO') {
                    alert("Metal element must be 'Fe' or 'Co'");
                    return;
                }
                
                // 转换为标准格式 (首字母大写)
                metalElements = metalElements.charAt(0) + metalElements.slice(1).toLowerCase();
            }

            // 进行预测
            const massActivity = parseFloat(massActivityInput);
            if (isNaN(massActivity) || massActivity < 0) {
                alert('Please enter a valid mass activity value (≥ 0)');
                return;
            }

            const result = performPrediction(isPt, massActivity, metalElements);
            displayResults(result, isPt, metalElements, massActivityInput);
        });
    }

    /**
     * 重置按钮处理
     */
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            form.reset();
            metalElementsSection.classList.add('hidden');
            resultsCard.classList.add('hidden');
            placeholderCard.classList.remove('hidden');
        });
    }

    /**
     * 执行预测
     */
    function performPrediction(isPt, massActivity, metalElements) {
        // 调用算法
        return predictionAlgorithm.predictHalfWave(isPt, massActivity, metalElements);
    }

    /**
     * 显示预测结果
     */
    function displayResults(prediction, isPt, metalElements, massActivityInput) {
        // 首先重置成功/错误消息框
        const messageBox = resultsCard.querySelector('.bg-green-50, .bg-red-50');
        if (messageBox) {
            messageBox.className = 'bg-green-50 border-l-4 border-green-400 p-4';
            messageBox.innerHTML = `<p class="text-sm text-green-800">
                <strong>✓ Success:</strong> Prediction completed using actual database mapping.
            </p>`;
        }

        if (prediction.success) {
            // 更新结果值
            const halfWaveValue = prediction.halfWavePotential.toFixed(3);
            document.getElementById('half-wave-result').textContent = halfWaveValue;

            // 更新源信息
            document.getElementById('pdf-path').textContent = prediction.sourcePdf;

            // 更新查询详情
            const catalystTypeLabel = isPt ? 'Platinum (Pt)' : `${metalElements} (Non-Pt)`;

            document.getElementById('cat-type').textContent = catalystTypeLabel;
            document.getElementById('input-mass').textContent = massActivityInput;

        } else {
            // 预测失败 - 显示错误
            document.getElementById('half-wave-result').textContent = 'ERROR';
            document.getElementById('pdf-path').textContent = 'No match found';
            
            const catalystTypeLabel = isPt ? 'Platinum (Pt)' : `${metalElements} (Non-Pt)`;
            document.getElementById('cat-type').textContent = catalystTypeLabel;
            document.getElementById('input-mass').textContent = massActivityInput;

            // 替换成功消息为错误消息
            const successMsg = resultsCard.querySelector('.bg-green-50, .bg-red-50');
            if (successMsg) {
                successMsg.className = 'bg-red-50 border-l-4 border-red-400 p-4';
                successMsg.innerHTML = `<p class="text-sm text-red-800">
                    <strong>✗ Error:</strong> ${prediction.error}
                </p>`;
            }
        }

        // 显示结果卡片，隐藏占位符
        resultsCard.classList.remove('hidden');
        placeholderCard.classList.add('hidden');

        // 滚动到结果
        resultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});

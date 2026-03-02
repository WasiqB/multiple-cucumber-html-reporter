/**
 * Chart initialization and rendering
 */
window.ReportCharts = {
  // Shared options
  getCommonOptions: () => {
    const isDark = window.ReportUtils.isDark();
    return {
      textColor: window.ReportUtils.getTextColor(),
      gridColor: window.ReportUtils.getGridColor(),
      theme: isDark ? 'dark' : 'light',
      colors: ['#22c55e', '#ef4444', '#eab308'],
    };
  },

  initDashboard: (data) => {
    const { textColor, gridColor, theme, colors } = window.ReportCharts.getCommonOptions();
    const clear = window.ReportUtils.clear;

    const toggleChart = (selector, hasData) => {
      const el = document.querySelector(selector);
      if (!el) return;
      const card = el.closest('.bg-card') || el.parentElement;
      if (hasData) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    };

    // 1. Features Status Chart
    clear('#features-chart');
    const featuresSeries = [data.summary.passed, data.summary.failed, data.summary.skipped];
    const hasFeatures = featuresSeries.some((v) => v > 0);
    toggleChart('#features-chart', hasFeatures);
    if (hasFeatures) {
      new ApexCharts(document.querySelector('#features-chart'), {
        series: featuresSeries,
        labels: ['Passed', 'Failed', 'Skipped'],
        chart: { type: 'donut', height: 250, animations: { enabled: false }, toolbar: { show: false } },
        colors: colors,
        tooltip: { theme },
        legend: { position: 'bottom', labels: { colors: textColor } },
        dataLabels: { enabled: false },
        plotOptions: {
          pie: {
            donut: {
              size: '70%',
              labels: {
                show: true,
                total: { show: true, label: 'Features', color: textColor, fontSize: '12px' },
                value: { show: true, color: textColor, fontSize: '20px', fontWeight: 'bold' },
              },
            },
          },
        },
        stroke: { width: 0 },
      }).render();
    }

    // 2. Scenarios Status Chart
    clear('#scenarios-chart');
    const scenariosSeries = [data.scenarios.passed, data.scenarios.failed, data.scenarios.skipped];
    const hasScenarios = scenariosSeries.some((v) => v > 0);
    toggleChart('#scenarios-chart', hasScenarios);
    if (hasScenarios) {
      new ApexCharts(document.querySelector('#scenarios-chart'), {
        series: scenariosSeries,
        labels: ['Passed', 'Failed', 'Skipped'],
        chart: { type: 'donut', height: 250, animations: { enabled: false }, toolbar: { show: false } },
        colors: colors,
        tooltip: { theme },
        legend: { position: 'bottom', labels: { colors: textColor } },
        dataLabels: { enabled: false },
        plotOptions: {
          pie: {
            donut: {
              size: '70%',
              labels: {
                show: true,
                total: { show: true, label: 'Scenarios', color: textColor, fontSize: '12px' },
                value: { show: true, color: textColor, fontSize: '20px', fontWeight: 'bold' },
              },
            },
          },
        },
        stroke: { width: 0 },
      }).render();
    }

    // 3. Device & OS Chart
    clear('#device-os-chart');
    const devices = {};
    data.features.forEach((f) => {
      const key = f.device || 'N/A';
      if (!devices[key]) devices[key] = { passed: 0, failed: 0, skipped: 0 };
      devices[key].passed += f.passed || 0;
      devices[key].failed += f.failed || 0;
      devices[key].skipped += f.skipped || 0;
    });
    const deviceKeys = Object.keys(devices);
    const hasDevices = deviceKeys.length > 0;
    toggleChart('#device-os-chart', hasDevices);
    if (hasDevices) {
      new ApexCharts(document.querySelector('#device-os-chart'), {
        series: [
          { name: 'Passed', data: deviceKeys.map((k) => devices[k].passed) },
          { name: 'Failed', data: deviceKeys.map((k) => devices[k].failed) },
          { name: 'Skipped', data: deviceKeys.map((k) => devices[k].skipped) },
        ],
        chart: { type: 'bar', height: 250, stacked: true, toolbar: { show: false }, animations: { enabled: false } },
        xaxis: { categories: deviceKeys, labels: { style: { colors: textColor } } },
        yaxis: { labels: { style: { colors: textColor } } },
        colors: colors,
        plotOptions: { bar: { borderRadius: 4, horizontal: true } },
        grid: { borderColor: gridColor, padding: { left: 20 } },
        legend: { labels: { colors: textColor } },
        tooltip: { theme },
      }).render();
    }

    // 4. Browsers Chart
    clear('#browser-chart');
    const browsers = {};
    data.features.forEach((f) => {
      const key = f.browser || 'N/A';
      if (!browsers[key]) browsers[key] = { passed: 0, failed: 0, skipped: 0 };
      browsers[key].passed += f.passed || 0;
      browsers[key].failed += f.failed || 0;
      browsers[key].skipped += f.skipped || 0;
    });
    const browserKeys = Object.keys(browsers);
    const hasBrowsers = browserKeys.length > 0;
    toggleChart('#browser-chart', hasBrowsers);
    if (hasBrowsers) {
      new ApexCharts(document.querySelector('#browser-chart'), {
        series: [
          { name: 'Passed', data: browserKeys.map((k) => browsers[k].passed) },
          { name: 'Failed', data: browserKeys.map((k) => browsers[k].failed) },
          { name: 'Skipped', data: browserKeys.map((k) => browsers[k].skipped) },
        ],
        chart: { type: 'bar', height: 250, stacked: true, toolbar: { show: false }, animations: { enabled: false } },
        xaxis: { categories: browserKeys, labels: { style: { colors: textColor } } },
        yaxis: { labels: { style: { colors: textColor } } },
        colors: colors,
        plotOptions: { bar: { borderRadius: 4, horizontal: true } },
        grid: { borderColor: gridColor, padding: { left: 20 } },
        legend: { labels: { colors: textColor } },
        tooltip: { theme },
      }).render();
    }

    // 5. Steps Status Chart (Aggregate fallback if summary is missing)
    clear('#steps-status-chart');
    let stepsData = data.summary.steps;

    if (!stepsData || (stepsData.passed === 0 && stepsData.failed === 0 && stepsData.skipped === 0)) {
      stepsData = { passed: 0, failed: 0, skipped: 0 };
      data.features.forEach((f) => {
        f.elements.forEach((s) => {
          s.steps.forEach((step) => {
            const status = step.result?.status;
            if (status === 'passed') stepsData.passed++;
            else if (status === 'failed' || status === 'ambiguous') stepsData.failed++;
            else stepsData.skipped++;
          });
        });
      });
    }

    const stepsSeries = [stepsData.passed, stepsData.failed, stepsData.skipped];
    const hasSteps = stepsSeries.some((v) => v > 0);
    toggleChart('#steps-status-chart', hasSteps);
    if (hasSteps) {
      new ApexCharts(document.querySelector('#steps-status-chart'), {
        series: stepsSeries,
        labels: ['Passed', 'Failed', 'Skipped'],
        chart: { type: 'donut', height: 250, animations: { enabled: false }, toolbar: { show: false } },
        colors: colors,
        tooltip: { theme },
        legend: { position: 'bottom', labels: { colors: textColor } },
        dataLabels: { enabled: false },
        plotOptions: {
          pie: {
            donut: {
              size: '70%',
              labels: {
                show: true,
                total: { show: true, label: 'Steps', color: textColor, fontSize: '12px' },
                value: { show: true, color: textColor, fontSize: '20px', fontWeight: 'bold' },
              },
            },
          },
        },
        stroke: { width: 0 },
      }).render();
    }

    // 6. Status Trend Chart
    clear('#status-trend-chart');
    const hasTrend = data.features.length > 0;
    toggleChart('#status-trend-chart', hasTrend);
    if (hasTrend) {
      new ApexCharts(document.querySelector('#status-trend-chart'), {
        series: [
          { name: 'Passed', data: data.features.map((f) => f.passed || 0) },
          { name: 'Failed', data: data.features.map((f) => f.failed || 0) },
          { name: 'Skipped', data: data.features.map((f) => f.skipped || 0) },
        ],
        chart: { type: 'bar', height: 320, stacked: true, toolbar: { show: false }, animations: { enabled: false } },
        xaxis: {
          categories: data.features.map((f) => (f.name.length > 20 ? f.name.substring(0, 17) + '...' : f.name)),
          labels: { style: { colors: textColor, fontSize: '10px' }, rotate: -30 },
        },
        yaxis: { labels: { style: { colors: textColor } } },
        colors: colors,
        grid: { borderColor: gridColor, padding: { bottom: 40 } },
        legend: { position: 'top', horizontalAlign: 'right', labels: { colors: textColor } },
        tooltip: { theme },
      }).render();
    }

    // 7. Tag Distribution
    clear('#tag-distribution-chart');
    const tags = {};
    data.features.forEach((f) => {
      (f.tags || []).forEach((t) => {
        const name = typeof t === 'string' ? t : t.name;
        tags[name] = (tags[name] || 0) + 1;
      });
    });
    const tagKeys = Object.keys(tags)
      .sort((a, b) => tags[b] - tags[a])
      .slice(0, 10);
    const hasTags = tagKeys.length > 0;
    toggleChart('#tag-distribution-chart', hasTags);
    if (hasTags) {
      new ApexCharts(document.querySelector('#tag-distribution-chart'), {
        series: [{ name: 'Features', data: tagKeys.map((k) => tags[k]) }],
        chart: { type: 'bar', height: 250, toolbar: { show: false }, animations: { enabled: false } },
        xaxis: { categories: tagKeys, labels: { style: { colors: textColor } } },
        yaxis: { labels: { style: { colors: textColor } } },
        colors: ['#6366f1'],
        plotOptions: { bar: { borderRadius: 4, horizontal: true } },
        grid: { borderColor: gridColor },
        tooltip: { theme },
      }).render();
    }
  },

  initFeature: (feature) => {
    const { textColor, gridColor, theme, colors } = window.ReportCharts.getCommonOptions();
    const clear = window.ReportUtils.clear;
    const isDark = window.ReportUtils.isDark();

    const toggleChart = (selector, hasData) => {
      const el = document.querySelector(selector);
      if (!el) return;
      const card = el.closest('.bg-card') || el.parentElement;
      if (hasData) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    };

    // 1. Scenario Distribution (Donut)
    clear('#feature-scenarios-chart');
    const scenarioSeries = [
      feature.scenarios.passed || 0,
      feature.scenarios.failed || 0,
      feature.scenarios.skipped || 0,
    ];
    const hasScenarios = scenarioSeries.some((v) => v > 0);
    toggleChart('#feature-scenarios-chart', hasScenarios);
    if (hasScenarios) {
      new ApexCharts(document.querySelector('#feature-scenarios-chart'), {
        series: scenarioSeries,
        labels: ['Passed', 'Failed', 'Skipped'],
        chart: { type: 'donut', height: 250, animations: { enabled: false } },
        colors: colors,
        tooltip: { theme },
        legend: { position: 'bottom', labels: { colors: textColor } },
        plotOptions: {
          pie: {
            donut: {
              size: '70%',
              labels: {
                show: true,
                total: { show: true, label: 'Total', color: textColor, fontSize: '12px' },
                value: { show: true, color: textColor, fontSize: '20px', fontWeight: 'bold' },
              },
            },
          },
        },
        stroke: { width: 0 },
      }).render();
    }

    // 2. Scenario Distribution (Line)
    clear('#feature-execution-chart');
    const durations = (feature.elements || []).map((s) => s.duration || 0);
    const hasDurations = durations.length > 0 && durations.some((v) => v > 0);
    toggleChart('#feature-execution-chart', hasDurations);
    if (hasDurations) {
      new ApexCharts(document.querySelector('#feature-execution-chart'), {
        series: [{ name: 'Duration (s)', data: durations }],
        chart: { type: 'line', height: 250, toolbar: { show: false }, animations: { enabled: false } },
        stroke: { curve: 'smooth', width: 3 },
        xaxis: {
          categories: (feature.elements || []).map((s) =>
            s.name.length > 25 ? s.name.substring(0, 22) + '...' : s.name,
          ),
          labels: { style: { colors: textColor, fontSize: '10px' }, rotate: -30 },
        },
        yaxis: { labels: { style: { colors: textColor } } },
        colors: ['#3b82f6'],
        markers: { size: 4 },
        grid: { borderColor: gridColor, padding: { bottom: 40 } },
        tooltip: { theme, y: { formatter: (v) => v + 's' } },
      }).render();
    }

    // 2.5 Time Distribution
    clear('#feature-time-dist-chart');
    const hasBoxPlot = durations.length > 0 && durations.some((v) => v > 0);
    toggleChart('#feature-time-dist-chart', hasBoxPlot);
    if (hasBoxPlot) {
      new ApexCharts(document.querySelector('#feature-time-dist-chart'), {
        series: [
          {
            name: 'Execution Time',
            type: 'boxPlot',
            data: [
              {
                x: 'Scenarios',
                y: window.ReportUtils.calculateBoxPlotData(durations),
              },
            ],
          },
        ],
        chart: { type: 'boxPlot', height: 250, toolbar: { show: false }, animations: { enabled: false } },
        title: { text: 'Duration Distribution (s)', align: 'left', style: { color: textColor, fontSize: '12px' } },
        plotOptions: {
          boxPlot: {
            colors: { upper: '#3b82f6', lower: '#60a5fa' },
          },
        },
        stroke: { colors: [isDark ? '#475569' : '#cbd5e1'] },
        grid: { borderColor: gridColor },
        xaxis: {
          categories: ['Scenarios'],
          labels: { style: { colors: textColor } },
        },
        yaxis: { labels: { style: { colors: textColor } } },
        tooltip: { theme },
      }).render();
    }

    // 3. Scenario Step Time Trend
    clear('#feature-step-trend-chart');
    const stepDurations = [];
    (feature.elements || []).forEach((s) => {
      s.steps.forEach((step) => {
        const duration = step.result?.duration || 0;
        stepDurations.push(duration / 1000000000); // ns to s
      });
    });
    const hasStepTrend = stepDurations.some((v) => v > 0);
    toggleChart('#feature-step-trend-chart', hasStepTrend);
    if (hasStepTrend) {
      new ApexCharts(document.querySelector('#feature-step-trend-chart'), {
        series: [{ name: 'Step duration', data: stepDurations }],
        chart: { type: 'line', height: 250, toolbar: { show: false }, animations: { enabled: false } },
        stroke: { curve: 'smooth', width: 2 },
        xaxis: { labels: { show: false } },
        yaxis: { labels: { style: { colors: textColor } } },
        colors: ['#8b5cf6'],
        markers: { size: 3 },
        grid: { borderColor: gridColor },
        tooltip: { theme },
      }).render();
    }

    // 4. Steps count
    clear('#feature-steps-per-scenario-chart');
    const stepCounts = (feature.elements || []).map((s) => s.steps.length);
    const hasStepCounts = stepCounts.some((v) => v > 0);
    toggleChart('#feature-steps-per-scenario-chart', hasStepCounts);
    if (hasStepCounts) {
      new ApexCharts(document.querySelector('#feature-steps-per-scenario-chart'), {
        series: [{ name: 'Steps', data: stepCounts }],
        chart: { type: 'bar', height: 250, toolbar: { show: false }, animations: { enabled: false } },
        xaxis: {
          categories: (feature.elements || []).map((s) => s.name.substring(0, 15) + '...'),
          labels: { style: { colors: textColor, fontSize: '10px' } },
        },
        yaxis: { labels: { style: { colors: textColor } } },
        colors: ['#f59e0b'],
        plotOptions: { bar: { borderRadius: 4 } },
        grid: { borderColor: gridColor },
        tooltip: { theme },
      }).render();
    }
  },
};

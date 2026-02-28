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

    // 1. Features Status Chart
    clear('#features-chart');
    new ApexCharts(document.querySelector('#features-chart'), {
      series: [data.summary.features.passed, data.summary.features.failed, data.summary.features.skipped],
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

    // 2. Scenarios Status Chart
    clear('#scenarios-chart');
    new ApexCharts(document.querySelector('#scenarios-chart'), {
      series: [data.summary.scenarios.passed, data.summary.scenarios.failed, data.summary.scenarios.skipped],
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

    // 3. Device & OS Chart
    clear('#device-os-chart');
    const devices = {};
    data.features.forEach((f) => {
      const key = f.device || 'Unknown';
      if (!devices[key]) devices[key] = { passed: 0, failed: 0, skipped: 0 };
      devices[key].passed += f.passed || 0;
      devices[key].failed += f.failed || 0;
      devices[key].skipped += f.skipped || 0;
    });
    const deviceKeys = Object.keys(devices);
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

    // 4. Browsers Chart
    clear('#browser-chart');
    const browsers = {};
    data.features.forEach((f) => {
      const key = f.browser || 'Unknown';
      if (!browsers[key]) browsers[key] = { passed: 0, failed: 0, skipped: 0 };
      browsers[key].passed += f.passed || 0;
      browsers[key].failed += f.failed || 0;
      browsers[key].skipped += f.skipped || 0;
    });
    const browserKeys = Object.keys(browsers);
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

    // 5. Steps Status Chart (Aggregate fallback if summary is missing)
    clear('#steps-status-chart');
    let stepsData = data.summary.steps;

    if (!stepsData || (stepsData.passed === 0 && stepsData.failed === 0 && stepsData.skipped === 0)) {
      stepsData = { passed: 0, failed: 0, skipped: 0 };
      data.features.forEach((f) => {
        stepsData.passed += f.passedSteps || 0;
        stepsData.failed += f.failedSteps || 0;
        stepsData.skipped += f.skippedSteps || 0;
      });
    }

    new ApexCharts(document.querySelector('#steps-status-chart'), {
      series: [stepsData.passed, stepsData.failed, stepsData.skipped],
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

    // 6. Status Trend Chart
    clear('#status-trend-chart');
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

    // 7. Tag Distribution
    clear('#tag-distribution-chart');
    const tags = {};
    data.features.forEach((f) => {
      (f.tags || []).forEach((t) => {
        tags[t] = (tags[t] || 0) + 1;
      });
    });
    const tagKeys = Object.keys(tags)
      .sort((a, b) => tags[b] - tags[a])
      .slice(0, 10);
    if (tagKeys.length > 0) {
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

    // 1. Scenario Distribution
    clear('#feature-scenarios-chart');
    new ApexCharts(document.querySelector('#feature-scenarios-chart'), {
      series: [feature.passed || 0, feature.failed || 0, feature.skipped || 0],
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

    // 2. Execution Summary (Line)
    clear('#feature-execution-chart');
    const durations = feature.scenarios.map((s) => {
      const parts = s.duration.split(':');
      return parseFloat(parts[parts.length - 1]);
    });
    new ApexCharts(document.querySelector('#feature-execution-chart'), {
      series: [{ name: 'Duration (s)', data: durations }],
      chart: { type: 'line', height: 250, toolbar: { show: false }, animations: { enabled: false } },
      stroke: { curve: 'smooth', width: 3 },
      xaxis: {
        categories: feature.scenarios.map((s) => (s.name.length > 25 ? s.name.substring(0, 22) + '...' : s.name)),
        labels: { style: { colors: textColor, fontSize: '10px' }, rotate: -30 },
      },
      yaxis: { labels: { style: { colors: textColor } } },
      colors: ['#3b82f6'],
      markers: { size: 4 },
      grid: { borderColor: gridColor, padding: { bottom: 40 } },
      tooltip: { theme, y: { formatter: (v) => v + 's' } },
    }).render();

    // 2.5 Time Distribution
    clear('#feature-time-dist-chart');
    if (durations.length > 0) {
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
    feature.scenarios.forEach((s) => {
      s.steps.forEach((step) => {
        const parts = step.duration.split(':');
        stepDurations.push(parseFloat(parts[parts.length - 1]));
      });
    });
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

    // 4. Steps count
    clear('#feature-steps-per-scenario-chart');
    new ApexCharts(document.querySelector('#feature-steps-per-scenario-chart'), {
      series: [{ name: 'Steps', data: feature.scenarios.map((s) => s.steps.length) }],
      chart: { type: 'bar', height: 250, toolbar: { show: false }, animations: { enabled: false } },
      xaxis: {
        categories: feature.scenarios.map((s) => s.name.substring(0, 15) + '...'),
        labels: { style: { colors: textColor, fontSize: '10px' } },
      },
      yaxis: { labels: { style: { colors: textColor } } },
      colors: ['#f59e0b'],
      plotOptions: { bar: { borderRadius: 4 } },
      grid: { borderColor: gridColor },
      tooltip: { theme },
    }).render();
  },
};

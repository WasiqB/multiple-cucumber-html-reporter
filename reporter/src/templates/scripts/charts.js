/**
 * Chart initialization and rendering
 */
window.ReportCharts = {
  // Shared options
  getCommonOptions: () => {
    const isDark = window.ReportUtils.isDark();
    const css = getComputedStyle(document.documentElement);
    const statusColor = (name) => css.getPropertyValue(`--status-${name}`).trim();
    return {
      textColor: window.ReportUtils.getTextColor(),
      gridColor: window.ReportUtils.getGridColor(),
      theme: isDark ? 'dark' : 'light',
      colors: [
        statusColor('passed'),
        statusColor('failed'),
        statusColor('ambiguous'),
        statusColor('undefined'),
        statusColor('pending'),
        statusColor('skipped'),
      ],
    };
  },

  // Percentage labels are opt-in (reporter option `displayChartPercentages`).
  // When the option is off we keep the original plain donut: no slice labels,
  // a simple legend and a count-only tooltip.
  //
  // When it is on we split things up, because cramming "9 (35%)" onto a thin
  // ring gets ugly fast: the slice shows the percentage, the legend carries the
  // count ("Passed: 9"), and the tooltip has both ("9 (35.0%)").
  donutPercentOptions: (theme, textColor) => {
    const showPercentages = !!(window.ReportConfig && window.ReportConfig.displayChartPercentages);

    if (!showPercentages) {
      return {
        dataLabels: { enabled: false },
        legend: { position: 'bottom', labels: { colors: textColor } },
        tooltip: { theme },
      };
    }

    return {
      dataLabels: {
        enabled: true,
        // A tiny slice should still say something, not round down to a fake "0%"
        formatter: (val) => (val > 0 && val < 1 ? '<1%' : `${Math.round(val)}%`),
        style: { fontSize: '11px', fontWeight: '600' },
        dropShadow: { enabled: true, blur: 1, opacity: 0.45 },
      },
      legend: {
        position: 'bottom',
        labels: { colors: textColor },
        formatter: (name, opts) => {
          const count = opts.w.globals.series[opts.seriesIndex];
          return count === undefined ? name : `${name}: ${count}`;
        },
      },
      tooltip: {
        theme,
        y: {
          formatter: (val, opts) => {
            const total = opts.w.globals.series.reduce((a, b) => a + b, 0);
            const pct = total ? ((val / total) * 100).toFixed(1) : '0.0';
            return `${val} (${pct}%)`;
          },
        },
      },
    };
  },

  initDashboard: (data) => {
    const { textColor, gridColor, theme, colors } = window.ReportCharts.getCommonOptions();
    const donutOpts = window.ReportCharts.donutPercentOptions(theme, textColor);
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
    const featuresSeries = [
      data.summary.passed || 0,
      data.summary.failed || 0,
      data.summary.ambiguous || 0,
      data.summary.notDefined || 0,
      data.summary.pending || 0,
      data.summary.skipped || 0,
    ];
    const hasFeatures = featuresSeries.some((v) => v > 0);
    toggleChart('#features-chart', hasFeatures);
    if (hasFeatures) {
      new ApexCharts(document.querySelector('#features-chart'), {
        series: featuresSeries,
        labels: ['Passed', 'Failed', 'Ambiguous', 'Not Defined', 'Pending', 'Skipped'],
        chart: { type: 'donut', height: 250, animations: { enabled: false }, toolbar: { show: false } },
        colors: colors,
        ...donutOpts,
        plotOptions: {
          pie: {
            dataLabels: { offset: 0, minAngleToShowLabel: 0 },
            donut: {
              size: '66%',
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
    const scenariosSeries = [
      data.scenarios.passed || 0,
      data.scenarios.failed || 0,
      data.scenarios.ambiguous || 0,
      data.scenarios.notDefined || 0,
      data.scenarios.pending || 0,
      data.scenarios.skipped || 0,
    ];
    const hasScenarios = scenariosSeries.some((v) => v > 0);
    toggleChart('#scenarios-chart', hasScenarios);
    if (hasScenarios) {
      new ApexCharts(document.querySelector('#scenarios-chart'), {
        series: scenariosSeries,
        labels: ['Passed', 'Failed', 'Ambiguous', 'Not Defined', 'Pending', 'Skipped'],
        chart: { type: 'donut', height: 250, animations: { enabled: false }, toolbar: { show: false } },
        colors: colors,
        ...donutOpts,
        plotOptions: {
          pie: {
            dataLabels: { offset: 0, minAngleToShowLabel: 0 },
            donut: {
              size: '66%',
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
      const key = [f.device, f.os].filter(Boolean).join(' - ') || 'N/A';
      if (!devices[key]) devices[key] = { passed: 0, failed: 0, ambiguous: 0, undefined: 0, pending: 0, skipped: 0 };
      devices[key].passed += f.scenarios?.passed || f.passed || 0;
      devices[key].failed += f.scenarios?.failed || f.failed || 0;
      devices[key].ambiguous += f.scenarios?.ambiguous || f.ambiguous || 0;
      devices[key].undefined += f.scenarios?.notDefined || f.notDefined || 0;
      devices[key].pending += f.scenarios?.pending || f.pending || 0;
      devices[key].skipped += f.scenarios?.skipped || f.skipped || 0;
    });
    const deviceKeys = Object.keys(devices);
    const hasDevices = deviceKeys.length > 0;
    toggleChart('#device-os-chart', hasDevices);
    if (hasDevices) {
      new ApexCharts(document.querySelector('#device-os-chart'), {
        series: [
          { name: 'Passed', data: deviceKeys.map((k) => devices[k].passed) },
          { name: 'Failed', data: deviceKeys.map((k) => devices[k].failed) },
          { name: 'Ambiguous', data: deviceKeys.map((k) => devices[k].ambiguous) },
          { name: 'Not Defined', data: deviceKeys.map((k) => devices[k].undefined) },
          { name: 'Pending', data: deviceKeys.map((k) => devices[k].pending) },
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
      if (!browsers[key]) browsers[key] = { passed: 0, failed: 0, ambiguous: 0, undefined: 0, pending: 0, skipped: 0 };
      browsers[key].passed += f.scenarios?.passed || f.passed || 0;
      browsers[key].failed += f.scenarios?.failed || f.failed || 0;
      browsers[key].ambiguous += f.scenarios?.ambiguous || f.ambiguous || 0;
      browsers[key].undefined += f.scenarios?.notDefined || f.notDefined || 0;
      browsers[key].pending += f.scenarios?.pending || f.pending || 0;
      browsers[key].skipped += f.scenarios?.skipped || f.skipped || 0;
    });
    const browserKeys = Object.keys(browsers);
    const hasBrowsers = browserKeys.length > 0;
    toggleChart('#browser-chart', hasBrowsers);
    if (hasBrowsers) {
      new ApexCharts(document.querySelector('#browser-chart'), {
        series: [
          { name: 'Passed', data: browserKeys.map((k) => browsers[k].passed) },
          { name: 'Failed', data: browserKeys.map((k) => browsers[k].failed) },
          { name: 'Ambiguous', data: browserKeys.map((k) => browsers[k].ambiguous) },
          { name: 'Not Defined', data: browserKeys.map((k) => browsers[k].undefined) },
          { name: 'Pending', data: browserKeys.map((k) => browsers[k].pending) },
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
      stepsData = { passed: 0, failed: 0, ambiguous: 0, undefined: 0, pending: 0, skipped: 0 };
      data.features.forEach((f) => {
        (f.elements || []).forEach((s) => {
          (s.steps || []).forEach((step) => {
            const status = step.result?.status;
            if (status === 'passed') stepsData.passed++;
            else if (status === 'failed') stepsData.failed++;
            else if (status === 'ambiguous') stepsData.ambiguous++;
            else if (status === 'undefined') stepsData.undefined++;
            else if (status === 'pending') stepsData.pending++;
            else stepsData.skipped++;
          });
        });
      });
    }

    const stepsSeries = [
      stepsData.passed || 0,
      stepsData.failed || 0,
      stepsData.ambiguous || 0,
      stepsData.undefined || 0,
      stepsData.pending || 0,
      stepsData.skipped || 0,
    ];
    const hasSteps = stepsSeries.some((v) => v > 0);
    toggleChart('#steps-status-chart', hasSteps);
    if (hasSteps) {
      new ApexCharts(document.querySelector('#steps-status-chart'), {
        series: stepsSeries,
        labels: ['Passed', 'Failed', 'Ambiguous', 'Not Defined', 'Pending', 'Skipped'],
        chart: { type: 'donut', height: 250, animations: { enabled: false }, toolbar: { show: false } },
        colors: colors,
        ...donutOpts,
        plotOptions: {
          pie: {
            dataLabels: { offset: 0, minAngleToShowLabel: 0 },
            donut: {
              size: '66%',
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
          { name: 'Passed', data: data.features.map((f) => f.scenarios?.passed || f.passed || 0) },
          { name: 'Failed', data: data.features.map((f) => f.scenarios?.failed || f.failed || 0) },
          { name: 'Ambiguous', data: data.features.map((f) => f.scenarios?.ambiguous || f.ambiguous || 0) },
          { name: 'Not Defined', data: data.features.map((f) => f.scenarios?.notDefined || f.notDefined || 0) },
          { name: 'Pending', data: data.features.map((f) => f.scenarios?.pending || f.pending || 0) },
          { name: 'Skipped', data: data.features.map((f) => f.scenarios?.skipped || f.skipped || 0) },
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
    const donutOpts = window.ReportCharts.donutPercentOptions(theme, textColor);
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
      feature.scenarios.ambiguous || 0,
      feature.scenarios.notDefined || 0,
      feature.scenarios.pending || 0,
      feature.scenarios.skipped || 0,
    ];
    const hasScenarios = scenarioSeries.some((v) => v > 0);
    toggleChart('#feature-scenarios-chart', hasScenarios);
    if (hasScenarios) {
      new ApexCharts(document.querySelector('#feature-scenarios-chart'), {
        series: scenarioSeries,
        labels: ['Passed', 'Failed', 'Ambiguous', 'Not Defined', 'Pending', 'Skipped'],
        chart: { type: 'donut', height: 250, animations: { enabled: false } },
        colors: colors,
        ...donutOpts,
        plotOptions: {
          pie: {
            dataLabels: { offset: 0, minAngleToShowLabel: 0 },
            donut: {
              size: '66%',
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

    // 2. Top 10 Slowest Scenarios (Horizontal Bar)
    clear('#slowest-scenarios-chart');
    const allScenarios = (feature.elements || [])
      .filter((s) => s.type !== 'background' && (s.duration || 0) > 0)
      .map((s) => ({ label: s.name, duration: parseFloat((s.duration || 0).toFixed(3)) }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);
    const hasSlowestScenarios = allScenarios.length > 0;
    toggleChart('#slowest-scenarios-chart', hasSlowestScenarios);
    if (hasSlowestScenarios) {
      new ApexCharts(document.querySelector('#slowest-scenarios-chart'), {
        series: [{ name: 'Duration', data: allScenarios.map((s) => s.duration) }],
        chart: {
          type: 'bar',
          height: 250,
          toolbar: { show: false },
          animations: { enabled: false },
        },
        theme: { mode: theme },
        dataLabels: {
          enabled: true,
          textAnchor: 'start',
          style: {
            colors: [textColor],
            fontSize: '10px',
            fontWeight: 'bold',
          },
          offsetX: 5,
          formatter: (v) => v.toFixed(3) + 's',
        },
        plotOptions: {
          bar: {
            horizontal: true,
            borderRadius: 4,
            barHeight: '70%',
            distributed: true,
            dataLabels: { position: 'top' },
          },
        },
        xaxis: {
          categories: allScenarios.map((s) => s.label),
          labels: {
            style: { colors: textColor },
            formatter: (v) => (typeof v === 'number' ? v.toFixed(2) + 's' : v),
          },
        },
        yaxis: {
          labels: {
            style: { colors: textColor, fontSize: '10px' },
            maxWidth: 140,
            formatter: (v) => (v && v.length > 25 ? v.substring(0, 22) + '...' : v),
          },
        },
        colors: [
          '#ef4444',
          '#f97316',
          '#f59e0b',
          '#eab308',
          '#84cc16',
          '#22c55e',
          '#10b981',
          '#06b6d4',
          '#3b82f6',
          '#6366f1',
        ],
        grid: { borderColor: gridColor },
        legend: { show: false },
        tooltip: {
          theme,
          shared: true,
          intersect: false,
          y: { formatter: (v) => v.toFixed(3) + 's' },
        },
      }).render();
    }

    // 2.5 Top 10 Slowest Steps
    clear('#slowest-steps-chart');
    const allSteps = [];
    (feature.elements || []).forEach((s) => {
      (s.steps || []).forEach((step) => {
        const d = (step.result?.duration || 0) / 1000000000; // ns to s
        if (d > 0) {
          allSteps.push({
            label: `${step.keyword} ${step.name}`.trim(),
            duration: d,
          });
        }
      });
    });

    const slowestSteps = allSteps.sort((a, b) => b.duration - a.duration).slice(0, 10);

    const hasSlowSteps = slowestSteps.length > 0;
    toggleChart('#slowest-steps-chart', hasSlowSteps);
    if (hasSlowSteps) {
      new ApexCharts(document.querySelector('#slowest-steps-chart'), {
        series: [{ name: 'Duration', data: slowestSteps.map((s) => s.duration) }],
        chart: {
          type: 'bar',
          height: 250,
          toolbar: { show: false },
          animations: { enabled: false },
        },
        theme: { mode: theme },
        dataLabels: {
          enabled: true,
          textAnchor: 'start',
          style: {
            colors: [textColor],
            fontSize: '10px',
            fontWeight: 'bold',
          },
          offsetX: 5,
          formatter: (v) => v.toFixed(3) + 's',
        },
        plotOptions: {
          bar: {
            horizontal: true,
            borderRadius: 4,
            barHeight: '70%',
            distributed: true,
            dataLabels: {
              position: 'top',
            },
          },
        },
        xaxis: {
          categories: slowestSteps.map((s) => s.label),
          labels: {
            style: { colors: textColor },
            formatter: (v) => (typeof v === 'number' ? v.toFixed(2) + 's' : v),
          },
        },
        yaxis: {
          labels: {
            style: { colors: textColor, fontSize: '10px' },
            maxWidth: 140,
            formatter: (v) => (v.length > 25 ? v.substring(0, 22) + '...' : v),
          },
        },
        colors: [
          '#ef4444',
          '#f97316',
          '#f59e0b',
          '#eab308',
          '#84cc16',
          '#22c55e',
          '#10b981',
          '#06b6d4',
          '#3b82f6',
          '#6366f1',
        ],
        grid: { borderColor: gridColor },
        legend: { show: false },
        tooltip: {
          theme,
          shared: true,
          intersect: false,
          y: {
            formatter: (v) => v.toFixed(3) + 's',
          },
        },
      }).render();
    }

    // 3. Step Status Breakdown (Donut)
    clear('#feature-step-status-chart');
    const stepStatus = { passed: 0, failed: 0, ambiguous: 0, undefined: 0, pending: 0, skipped: 0 };
    (feature.elements || []).forEach((s) => {
      (s.steps || []).forEach((step) => {
        const status = step.result?.status;
        if (status === 'passed') stepStatus.passed++;
        else if (status === 'failed') stepStatus.failed++;
        else if (status === 'ambiguous') stepStatus.ambiguous++;
        else if (status === 'undefined') stepStatus.undefined++;
        else if (status === 'pending') stepStatus.pending++;
        else stepStatus.skipped++;
      });
    });
    const stepStatusSeries = [
      stepStatus.passed,
      stepStatus.failed,
      stepStatus.ambiguous,
      stepStatus.undefined,
      stepStatus.pending,
      stepStatus.skipped,
    ];
    const hasStepStatus = stepStatusSeries.some((v) => v > 0);
    toggleChart('#feature-step-status-chart', hasStepStatus);
    if (hasStepStatus) {
      new ApexCharts(document.querySelector('#feature-step-status-chart'), {
        series: stepStatusSeries,
        labels: ['Passed', 'Failed', 'Ambiguous', 'Not Defined', 'Pending', 'Skipped'],
        chart: { type: 'donut', height: 250, animations: { enabled: false }, toolbar: { show: false } },
        colors: colors,
        ...donutOpts,
        plotOptions: {
          pie: {
            dataLabels: { offset: 0, minAngleToShowLabel: 0 },
            donut: {
              size: '66%',
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

    // 5. Top 10 Tags Chart
    clear('#tag-distribution-chart');
    const tags = {};
    const featureTags = feature.tags || [];
    
    (feature.elements || []).forEach((s) => {
      const scenarioTags = (s.tags || []).concat(featureTags);
      const uniqueScenarioTags = [...new Set(scenarioTags.map(t => typeof t === 'string' ? t : t.name))];
      
      uniqueScenarioTags.forEach((name) => {
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
        series: [{ name: 'Scenarios', data: tagKeys.map((k) => tags[k]) }],
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
};

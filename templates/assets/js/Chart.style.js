function getChartColors() {
    const colorsMap = [
        {colorVar: "--passed-color", defaultColor: "#26B99A"},
        {colorVar: "--failed-color", defaultColor: "#E74C3C"},
        {colorVar: "--ambiguous-color", defaultColor: "#b73122"},
        {colorVar: "--not-defined-color", defaultColor: "#F39C12"},
        {colorVar: "--pending-color", defaultColor: "#FFD119"},
        {colorVar: "--skipped-color", defaultColor: "#3498DB"},
    ];
    const colors = []
    const style = window.getComputedStyle(document.body);
    for (let i = 0; i < colorsMap.length; i++) {
        colors.push(style.getPropertyValue(colorsMap[i].colorVar) || colorsMap[i].defaultColor)
    }
    return colors
}
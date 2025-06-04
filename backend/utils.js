function computeAverage(arr) {
  if (!arr || arr.length === 0) return 0;
  const sum = arr.reduce((acc, x) => acc + x, 0);
  return sum / arr.length;
}

function computeStdDev(arr) {
  if (!arr || arr.length === 0) return 0;
  const μ = computeAverage(arr);
  const variance = arr.reduce((acc, x) => acc + (x - μ) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}

function computeCovariance(arrX, arrY) {
  if (!arrX || !arrY || arrX.length === 0 || arrY.length === 0 || arrX.length !== arrY.length) {
    return 0;
  }
  const n = arrX.length;
  const μx = computeAverage(arrX);
  const μy = computeAverage(arrY);

  let covSum = 0;
  for (let i = 0; i < n; i++) {
    covSum += (arrX[i] - μx) * (arrY[i] - μy);
  }
  return covSum / n; 
}

function computeCorrelation(arrX, arrY) {
  if (!arrX || !arrY || arrX.length < 2 || arrY.length < 2 || arrX.length !== arrY.length) {
    return 0;
  }
  const cov = computeCovariance(arrX, arrY);
  const σx = computeStdDev(arrX);
  const σy = computeStdDev(arrY);
  if (σx === 0 || σy === 0) {
    return 0; 
  }
  return cov / (σx * σy);
}

function alignByTimestamp(hist1, hist2) {
  const map1 = new Map();
  for (const pt of hist1) {
    map1.set(pt.lastUpdatedAt, pt.price);
  }
  const map2 = new Map();
  for (const pt of hist2) {
    map2.set(pt.lastUpdatedAt, pt.price);
  }

  const common = [];
  for (const ts of map1.keys()) {
    if (map2.has(ts)) common.push(ts);
  }
  common.sort((a, b) => new Date(a) - new Date(b));

  const aligned1 = common.map((ts) => ({ price: map1.get(ts), lastUpdatedAt: ts }));
  const aligned2 = common.map((ts) => ({ price: map2.get(ts), lastUpdatedAt: ts }));

  return { aligned1, aligned2 };
}

module.exports = {
  computeAverage,
  computeStdDev,
  computeCovariance,
  computeCorrelation,
  alignByTimestamp,
};

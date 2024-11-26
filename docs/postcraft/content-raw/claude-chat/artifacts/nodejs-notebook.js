// Example RunKit notebook showing data analysis workflow
const moment = require('moment');
const lodash = require('lodash');

// Sample dataset
const sales = [
  { date: '2024-01-01', amount: 120 },
  { date: '2024-01-02', amount: 250 },
  { date: '2024-01-03', amount: 180 },
  { date: '2024-01-04', amount: 310 },
  { date: '2024-01-05', amount: 290 }
];

// Group sales by day using moment.js
const dailySales = lodash.groupBy(sales, (sale) => 
  moment(sale.date).format('dddd')
);

// Calculate average sales per day
const averageSales = Object.entries(dailySales).map(([day, sales]) => ({
  day,
  average: lodash.meanBy(sales, 'amount'),
  total: lodash.sumBy(sales, 'amount'),
  count: sales.length
}));

// Sort by average sales
const sortedResults = lodash.orderBy(averageSales, ['average'], ['desc']);

// Create a summary report
const report = sortedResults.map(({day, average, total, count}) => 
  `${day}: Avg $${average.toFixed(2)} (${count} sales, Total: $${total})`
).join('\n');

// Display results
console.log('Daily Sales Analysis:\n');
console.log(report);

// Visualize with a simple ASCII chart
const maxAvg = lodash.maxBy(sortedResults, 'average').average;
const scale = 50 / maxAvg;

console.log('\nSales Distribution (each █ = ~$' + (maxAvg/50).toFixed(2) + ')');
sortedResults.forEach(({day, average}) => {
  const bars = '█'.repeat(Math.round(average * scale));
  console.log(`${day.padEnd(10)} ${bars} $${average.toFixed(2)}`);
});

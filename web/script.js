
// Load data
d3.csv("spotify_clean.csv").then(function(data) {
  data.forEach(d => {
    d.Streams = +d.Streams;
  });

  // Ambil 10 lagu teratas
  const top10 = data.sort((a,b) => b.Streams - a.Streams).slice(0, 10);

  const margin = { top: 40, right: 30, bottom: 80, left: 150 },
        width = 900 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const x = d3.scaleLinear()
    .domain([0, d3.max(top10, d => d.Streams)])
    .range([0, width]);

  const y = d3.scaleBand()
    .range([0, height])
    .domain(top10.map(d => d.Track))
    .padding(0.2);

  svg.selectAll("rect")
    .data(top10)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", 0)
    .attr("y", d => y(d.Track))
    .attr("width", 0)
    .attr("height", y.bandwidth())
    .on("mouseover", function() { d3.select(this).attr("fill", "#f87171"); })
    .on("mouseout", function() { d3.select(this).attr("fill", "#38bdf8"); })
    .transition()
    .duration(800)
    .attr("width", d => x(d.Streams));

  svg.append("g")
    .call(d3.axisLeft(y));

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(5));
});

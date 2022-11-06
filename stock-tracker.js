
const apiURL = 'https://raw.githubusercontent.com/alagarrk/sample_data/main/sample-data.json';
let lineGraphData = [];

const margin = { top: 20, right: 20, bottom: 20, left: 50 }, width = 960 - margin.left - margin.right, height = 500;

const loadLineGraphData = d3.json(apiURL).then(response => {
    const dataset = response['chart']['result'][0];
    const data = dataset['indicators']['quote'][0];
    return dataset['timestamp'].map((time, index) => ({
        date: new Date(time * 1000),
        high: data['high'][index],
        low: data['low'][index],
        open: data['open'][index],
        close: data['close'][index]
    }));
});

loadLineGraphData.then((data) => {
    lineGraphData = data;
    initializeChartInstance();
});

function initializeChartInstance() {
    // To find min and max data range
    const xMin = d3.min(lineGraphData, d => {
        return d['date'];
    });

    const xMax = d3.max(lineGraphData, d => {
        return d['date'];
    });

    // Scale using range
    const xScale = d3
        .scaleTime()
        .domain([xMin, xMax])
        .range([0, width]);

    const yScale = d3
        .scaleLinear()
        .domain([80, 120])
        .range([height, 0]);


    // add chart SVG to the page
    const lineGraphSVG = d3
        .select('#line_chart_cntr')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // To create Axis (X & Y)
    lineGraphSVG
        .append('g')
        .attr('id', 'xAxis')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));
    lineGraphSVG
        .append('g')
        .attr('id', 'yAxis')
        .attr('transform', `translate(0, 0)`)
        .call(d3.axisLeft(yScale));

    const graphLines = [{ name: 'open', color: 'orange', id: 'open_line_graph' },
    { name: 'close', color: 'red', id: 'close_line_graph' },
    { name: 'low', color: 'yellow', id: 'low_line_graph' },
    { name: 'high', color: 'green', id: 'high_line_graph' }];

    graphLines.forEach((line) => {
        const graph = d3
            .line()
            .x(d => {
                return xScale(d['date']);
            })
            .y(d => {
                return yScale(d[line.name]);
            });
        lineGraphSVG
            .append('path')
            .data([lineGraphData]) // binds data to the line
            .style('fill', 'none')
            .attr('id', line.id)
            .attr('stroke', line.color)
            .attr('stroke-width', '2')
            .attr('d', graph);
    });


    // To render x and y crosshair
    const focusArea = lineGraphSVG
        .append('g')
        .attr('class', 'focus')
        .style('display', 'none');

    focusArea.append('circle').attr('r', 4.5);
    focusArea.append('line').classed('x', true);
    focusArea.append('line').classed('y', true);

    lineGraphSVG
        .append('rect')
        .attr('class', 'overlay')
        .attr('width', width)
        .attr('height', height)
        .style('pointer-events', 'all')
        .on('mouseover', () => focusArea.style('display', 'block'))
        .on('mouseout', () => focusArea.style('display', 'none'))
        .on('mousemove', generateCrosshair);

    d3.select('.overlay').style('fill', 'none');
    d3.select('.overlay').style('pointer-events', 'all');

    d3.selectAll('.focus line').style('fill', 'none');
    d3.selectAll('.focus line').style('stroke', '#67809f');
    d3.selectAll('.focus line').style('stroke-width', '2px');
    d3.selectAll('.focus line').style('stroke-dasharray', '3 3');

    //return insertion point
    const bisectDate = d3.bisector(d => d.date).left;

    /* To generate crosshair */
    function generateCrosshair() {
        const correspondingDate = xScale.invert(d3.mouse(this)[0]);
        const i = bisectDate(lineGraphData, correspondingDate, 1);
        const d0 = lineGraphData[i - 1];
        const d1 = lineGraphData[i];
        const currentPoint =
            correspondingDate - d0['date'] > d1['date'] - correspondingDate ? d1 : d0;
        focusArea.attr(
            'transform',
            `translate(${xScale(currentPoint['date'])}, ${yScale(
                currentPoint['close']
            )})`
        );
        focusArea
            .select('line.y')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', height - yScale(currentPoint['close']));

        updateLegend(currentPoint);
    }

    /* Legends */
    const updateLegend = currentData => {
        d3.selectAll('.lineLegend').remove();

        const legendKeys = Object.keys(lineGraphData[0]);
        const lineLegend = lineGraphSVG
            .selectAll('.lineLegend')
            .data(legendKeys)
            .enter()
            .append('g')
            .attr('class', 'lineLegend')
            .attr('transform', (d, i) => {
                return `translate(0, ${i * 20})`;
            });
        lineLegend
            .append('text')
            .text(d => {
                if (d === 'date') {
                    return `${d.charAt(0).toUpperCase() + d.slice(1)}: ${currentData[d].toLocaleDateString()}`;
                } else if (
                    d === 'high' ||
                    d === 'low' ||
                    d === 'open' ||
                    d === 'close'
                ) {
                    return `${d.charAt(0).toUpperCase() + d.slice(1)}: ${currentData[d].toFixed(2)}`;
                } else {
                    return `${d.charAt(0).toUpperCase() + d.slice(1)}: ${currentData[d]}`;
                }
            })
            .style('fill', 'black')
            .attr('transform', 'translate(15,9)'); //align texts with boxes
    };

}
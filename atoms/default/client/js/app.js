import * as d3 from 'd3'
import { numberWithCommas } from 'shared/js/util'
import $ from 'shared/js/util'
//import lockdownDates from 'raw-loader!./assets/lockdown-dates.csv'

//console.log(lockdownDates)

let isMobile = window.matchMedia('(max-width: 400px)').matches;
let isTablet = window.matchMedia('(max-width: 700px)').matches;
let isDesktop = window.matchMedia('(max-width: 900px)').matches;
let isWide = window.matchMedia('(max-width: 1300px)').matches;

const atomEl = d3.select('.interactive-wrapper').node();

let width = atomEl.getBoundingClientRect().width;

const parseTime = d3.timeParse("%Y/%m/%d");

let dates;

let datesJS;

let startEndDates;

let places = [];

let chartW;

if(width < 400)chartW = width;
if(width >= 400 && width < 900)chartW = (width ) - 5;
if(width >= 900)chartW = (width / 2) - 5;

let chartH = chartW * .4;
  
let marginBottom = chartH - 20;

let xScale = d3.scaleTime()
.range([0, chartW])

let colorScale = d3.scaleLinear()
.domain([0,100])
.range(['#FFFFFF', '#c70000']);

let yScale = d3.scaleLinear()
.range([chartH - 20, 1])

let line = d3.line()
.x(d => xScale(parseTime(d.date.substr(0,4) + '/' +  d.date.substr(4,2) + '/' + d.date.substr(6,2))))
.y(d => yScale(d.weekly))
.curve(d3.curveCardinal)

let area = d3.area()
.x(d => xScale(parseTime(d.date.substr(0,4) + '/' +  d.date.substr(4,2) + '/' + d.date.substr(6,2))))
.y0(d => yScale(d.new))
.y1(chartH - 20)
.curve(d3.curveStepBefore)

const listCountries = [
'South Korea',
'Singapore',
'United Kingdom',
'Germany',
'Spain',
'Italy',
'United States'
]

d3.json('https://interactive.guim.co.uk/docsdata-test/1wIC9r777Spb2wJrKFr0Y2zDbSVtsJ9pa6QIi1b5nkuY.json')
.then(casesRaw => {

	let data = casesRaw.sheets.index.filter( d => listCountries.indexOf(d.CountryName) != -1);

	let austria = data.filter( d => d.CountryName == listCountries[0])

	let dateIniYear = austria[0].Date.substr(0,4)
	let dateIniMonth = austria[0].Date.substr(4,2)
	let dateIniDay = austria[0].Date.substr(6,2)

	let dateEndYear = austria[austria.length -1].Date.substr(0,4)
	let dateEndMonth = austria[austria.length -1].Date.substr(4,2)
	let dateEndDay = austria[austria.length -1].Date.substr(6,2)

	dates = austria.map(d => d.Date)

	datesJS = austria.map(d => parseTime(d.Date.substr(0,4) + '/' +  d.Date.substr(4,2) + '/' + d.Date.substr(6,2)))

	startEndDates = d3.extent(datesJS);

	xScale.domain(startEndDates)


	listCountries.map((c,i) => {


		let country = data.filter(d => d.CountryName == c)

		places.push({country:c, cases:[]})


		country.map((d,j) => {

			let newCases = j == 0 ? d.ConfirmedCases : d.ConfirmedCases - country[j-1].ConfirmedCases;

			places[i].cases.push(

			{
				date: d.Date,
				acum: +d.ConfirmedCases,
				new: newCases,
				weekly:0,
				stringency:d.StringencyIndexForDisplay


			}

		)})

		places.map(p => {

			 p.cases.map((c,k) => {

			 	const data = p.cases.slice(k,k+7);

		      	c.weekly = d3.sum(data , s => s.new) / data.length;

			 })

		})


		

		//window.resize();

	})
console.log(places)

	places.forEach(d=>
		makeChart(d)
	)

	window.resize();

	

})


const makeChart = (con) =>{
/*console.log(con.cases)*/

      let div = d3.select(".charts-container").append('div')
      .attr('class', 'gv-chart-wrapper')

      let head = div.append("h3")
      .html(con.country)

      let totalText = div.append("p")
      .html( numberWithCommas(d3.max(con.cases, d => d.acum)) + ' confirmed cases')

      let avg = d3.sum(con.cases.slice(con.cases.length - 7, con.cases.length), d => d.new) / 7;

      let avgText = div.append("p")
      .html('Week average: ' + numberWithCommas(avg.toFixed(1)))

      let svgScale = div.append("svg")
      .attr('id', 'gv-cases-chart-key' + con.country)
      .attr("viewBox", [0, 0, chartW, 50]);

      svgScale
      .append('text')
      .attr('transform', 'translate(0,15)')
      .text('Stringency index')


      svgScale
      .append('text')
      .attr('transform', 'translate(0,37)')
      .text('0')

	  svgScale
      .append('text')
      .attr('transform', 'translate(75,37)')
      .text('100')

      svgScale
      .selectAll('rect')
      .data([0,10,20,30,40,50,60,70,80,90,100])
      .enter()
      .append('rect')
      .attr('width', 5)
      .attr('height', 15)
      .attr('x', (d,i) => (5 * i) + 15)
      .attr('y', 25)
      .attr('fill', d => colorScale(d))
      .attr('stroke', 'white')

      let svg = div.append("svg")
      .attr('id', 'gv-cases-chart-' + con.country)
      .attr("viewBox", [0, 0, chartW, chartH + 15]);

      yScale.domain([0, d3.max(con.cases, d => d.weekly)])

      //console.log(d3.max(con.cases, d => d.weekly),d3.max(con.cases, d => d.weekly)/ 2)

      let midPoint = +d3.format(".2r")(d3.max(con.cases, d => d.weekly) / 2);

      let midLine = d3.line()([[0,yScale(midPoint)], [chartW, yScale(midPoint)]])

      let baseLine = d3.line()([[0,yScale(0)], [chartW, yScale(0)]])

      const yAxis = svg.append("g")

      svg
      .selectAll('rect')
      .data(con.cases)
      .enter()
      .append('rect')
      //.attrs({ y: 0, width: 5, height: 15})
      .attr('width', 5)
      .attr('height', 15)
      .attr('x', d => xScale(parseTime(d.date.substr(0,4) + '/' +  d.date.substr(4,2) + '/' + d.date.substr(6,2))))
      .attr('y', marginBottom)
      .attr('fill', d => {

      	console.log(d.stringency)

      	if(d.stringency != '') return colorScale(d.stringency)
      		else return '#dadada'
      	

      })
      .attr('stroke', 'white')

      yAxis
      .append('path')
      .attr('d', midLine)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '1,2')
      .attr('stroke', 'black')
      .attr('fill', 'none')

      yAxis
      .append('path')
      .attr('d', baseLine)
      .attr('stroke-width', 1)
      .attr('stroke', 'black')
      .attr('fill', 'none')

      yAxis
      .append('text')
      .text(numberWithCommas(midPoint))
      .attr('transform', 'translate(0,' + (yScale(midPoint) - 5) + ')')
      .attr('midtext')
      
      svg
      .append('path')
      .datum(con.cases)
      .attr('d', area)
      .attr('fill', '#bababa')
      .attr('fill-opacity', .3);
      
      svg
      .append('path')
      .datum(con.cases)
      .attr('d', line)
      .attr('stroke', '#c70000')
      .attr('stroke-width', 1.5)
      .attr('fill', 'none');
      
      const xAxis = svg.append("g")
      .call(d3.axisBottom(xScale)
            .ticks(4)
      )
      .attr('transform', 'translate(' + 0 + ',' + (marginBottom + 15) + ')')

      xAxis.selectAll(".tick text")
      .attr('fill', '#333');

      xAxis.selectAll(".tick line")
      .attr('stroke', '#333');

      svg.selectAll(".domain").remove();
      
}
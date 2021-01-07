//import fs from 'fs'
import * as d3 from 'd3'
import { numberWithCommas } from 'shared/js/util'
import $ from 'shared/js/util'
import loadJson from 'shared/js/load-json'
import moment from 'moment'

let isMobile = window.matchMedia('(max-width: 700px)').matches;
let isDesktop = window.matchMedia('(min-width: 1200px)').matches;

const atomEl = d3.select('.charts-container').node();

let width = isMobile ? (atomEl.getBoundingClientRect().width / 2) -10: (atomEl.getBoundingClientRect().width / 3) - 10;
let height =  width * 2.5 / 5;

const parseTime = d3.timeParse("%Y-%m-%d");

const now = parseTime(moment().format('YYYY-MM-DD'))
const start = new Date(now.getFullYear(), 0, 0);
const diff = now - start;
const oneDay = 1000 * 60 * 60 * 24;
const day = Math.floor(diff / oneDay);

let startEndDates;

let marginBottom = 30;

let xScale = d3.scaleTime()
.range([0, width])

let colorScale = d3.scaleLinear()
.domain([0,25,50,75,100])
.range(['#0084c6', '#e6f5ff', "#f5be2c", "#ff7f00", '#ff1921']);

let yScale = d3.scaleLinear()
.range([height - marginBottom, 1])


let line = d3.line()
.x(d => xScale(d.date))
.y(d => yScale(d.weekly))
.curve(d3.curveCardinal)

let area = d3.area()
.x(d => xScale(d.date))
.y0(d => yScale(d.new))
.y1(height - marginBottom)
.curve(d3.curveStepBefore)



let countries = [];

const isoDict = [

{country:"Ireland",alpha:"IRL", newVariant:true},
{country:"Bolivia",group:"",alpha:"BOL", newVariant:false},
{country:"Israel",group:"",alpha:"ISR", newVariant:true},
{country:"United Kingdom",alpha:"GBR", newVariant:true},
{country:"Singapore",alpha:"SGP", newVariant:true},
{country:"Lebanon" ,alpha:"LBN", newVariant:false},
{country:"South Africa",alpha:"ZAF", newVariant:true},
{country:"Czechia" ,alpha:"CZE", newVariant:false},
{country:"Honduras" ,alpha:"HND", newVariant:false},
{country:"Portugal",alpha:"PRT", newVariant:true}
]


loadJson('<%= path %>/stringency_data/stringency.json')
.then(casesRaw => {

  casesRaw[0].countries.map(entry => {

    let alpha = entry.name

    let countryObj = []

    let currentC = 0;

    let prevCases = 0;

    let newC = null;

    let newS = null;

    let newCountry = casesRaw.map(dates => {

      let country = dates.countries.find(country => country.name == alpha);

      if(country)
      {

        if(country.cases != null)
        {


          newC = country.cases - prevCases >= 0 ? country.cases - prevCases : null;

          currentC = newC;


        }

        if(country.stringency != null)
        {
          newS = country.stringency
        }
        

        countryObj.push(
        {
          country:alpha,
          date:parseTime(dates.date),
          stringency:newS,
          cases:country.cases,
          new:newC,
          weekly:null
        })

        prevCases = country.cases;
      }
      else
      {
        countryObj.push(
        {
          country:alpha,
          date:parseTime(dates.date),
          stringency:newS,
          cases:prevCases,
          new:currentC,
          weekly:null
        })

        prevCases += currentC;

      }

    })


    for (let i = countryObj.length-1; i >= 0; i--) {



      let weekData = countryObj.slice(i-7,i);

              //console.log(weekData, weekData.length, d3.sum(weekData , s => s.new) / 7, countryObj[i].weekly)

              countryObj[i].weekly = d3.sum(weekData , s => s.new) / 7;
              
            }
            let startEndDates = d3.extent(countryObj, d => d.date)

            xScale.domain(startEndDates)


            let maxW = d3.max(countryObj, d => d.weekly)
            let maxN = d3.max(countryObj, d => d.new)

            let max = maxW * 100 / maxN >= 65 ? maxN : maxW + 1000

            yScale.domain([0, max])

            countries.push({alpha:alpha, countryData:countryObj})

            makeChart(alpha, countryObj)

          })
})


let key1 = d3.select(".charts-container").append('div')
.attr('class', 'key-container');

key1.append('p').html('No measures')

key1
.append('div')
.attr('class','key')
.html(`<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
 viewBox="0 0 87.5 7" width="87.5px" height="7px" xml:space="preserve">
 <style type="text/css">
 .st0{fill:#056DA1;}
 .st1{fill:#E6F5FF;}
 .st2{fill:#F5BE2C;}
 .st3{fill:#FF7F00;}
 .st4{fill:#FF1921;}
 </style>
 <rect class="st0" x="0" y="0" width="17" height="7"/>
 <rect x="17" y="0" class="st1" width="17.6" height="7"/>
 <rect x="34.6" y="0" class="st2" width="17.6" height="7"/>
 <rect x="52.3" y="0" class="st3" width="17.6" height="7"/>
 <rect x="69.9" y="0" class="st4" width="17.6" height="7"/>
 </svg>`)
key1.append('p').html('Total lockdown')

const makeChart = (alpha, countryObj) =>{

  let match = isoDict.find(iso => iso.alpha === alpha)

  let stringency = countryObj[countryObj.length-1].stringency;

  let sumThisWeek = d3.sum(countryObj.slice(countryObj.length-7, countryObj.length), s => s.new)
  let sumLastWeek = d3.sum(countryObj.slice(countryObj.length-21, countryObj.length-14), s => s.new)

  let variation = ((sumThisWeek - sumLastWeek) / sumLastWeek) * 100;

  let tw = d3.select('.charts-container').append('div')
  .attr('class', 'gv-chart-wrapper')

  let head = tw.append("h3")
  .attr('class', 'country-name')
  .html(match.country)

  let sign = variation > 0 ? '+' : ''
  let formatDecimalComma = d3.format(",.1f");

  let subhead = tw.append("div")
  .attr('class', 'subhead')

  if(isoDict.find(f => f.alpha === alpha).newVariant)
  {

    let blobGroup = subhead.append('div')
    .attr('class', 'blob-group')

    blobGroup.append('span')
    .attr('class', 'gv-blob')

    blobGroup.append('span')
    .attr('class', 'gv-new-variant')
    .html('New variant identified')

    subhead.append("span")
    .attr('class', 'gv-variation')
    .html(sign + formatDecimalComma(variation) + '% vs two weeks ago' )
  }
  else{
    subhead.append("span")
    .attr('class', 'gv-variation')
    .html(sign + formatDecimalComma(variation) + '% vs two weeks ago' )
  }

  
  let svg = tw.append("svg")
  .attr('id', 'gv-cases-chart-' + alpha)
  .attr("width", width)
  .attr("height", height)

  svg.append("g")
  .selectAll('rect')
  .data(countryObj)
  .enter()
  .append('rect')
  .attr('width', width / countryObj.length)
  .attr('class', d => d.date)
  .attr('height', 10)
  .attr('x', d => xScale(d.date)) 
  .attr('y', height - marginBottom)
  .attr('fill', d => colorScale(d.stringency))

  const yAxis = svg.append("g")

  yAxis
  .append('path')
  .attr('d', baseLine)
  .attr('class', 'baseline')

  svg
  .append('path')
  .datum(countryObj)
  .attr('d', line)
  .attr('class','line-chart')


  let midPoint = +d3.format(".2r")(d3.max(countryObj, d => d.weekly) / 2);

  let midLine = d3.line()([[0,yScale(midPoint)], [width, yScale(midPoint)]])

  let baseLine = d3.line()([[0,yScale(0)], [width, yScale(0)]])

  yAxis
  .append('path')
  .attr('d', midLine)
  .attr('class', 'midline')

  yAxis
  .append('text')
  .text(numberWithCommas(midPoint))
  .attr('transform', 'translate(0,' + (yScale(midPoint) - 5) + ')')
  .attr('class','midtext')

  const xAxis = svg.append("g")
  .call(d3.axisBottom(xScale)
    .ticks(5)
    .tickFormat(d3.timeFormat("%b"))
    )
  .attr('transform', 'translate(' + 0 + ',' + (height - marginBottom + 7) + ')')

  let tickTexts = xAxis.selectAll(".tick text")
  .attr('class', 'tick-text')

  d3.select(tickTexts.nodes()[0]).attr('text-anchor', 'start')
  d3.select(tickTexts.nodes()[4]).attr('text-anchor', 'end')


  xAxis.selectAll(".tick line")
  .attr('class', 'tick-line')
  .attr('y1', 3)  
  .attr('y2', 8);

  yAxis.selectAll("text")
  .attr('class', 'tick-text')

  svg.selectAll(".domain").remove();

}

//import fs from 'fs'
import * as d3 from 'd3'
import { numberWithCommas } from 'shared/js/util'
import $ from 'shared/js/util'
import loadJson from 'shared/js/load-json'
import moment from 'moment'

let isMobile = window.matchMedia('(max-width: 700px)').matches;
let isDesktop = window.matchMedia('(min-width: 1200px)').matches;

const atomEl = d3.select('#interactive-slot-1').node();

let width = isMobile ? (atomEl.getBoundingClientRect().width / 2) -10: (atomEl.getBoundingClientRect().width / 3) - 10;
let height =  width * 2.5 / 5;

console.log(atomEl.getBoundingClientRect().width, width, height)

const parseTime = d3.timeParse("%Y-%m-%d");

const now = parseTime(moment().format('YYYY-MM-DD'))
const start = new Date(now.getFullYear(), 0, 0);
const diff = now - start;
const oneDay = 1000 * 60 * 60 * 24;
const day = Math.floor(diff / oneDay);

let startEndDates;

let marginBottom = 30;

let xScale = d3.scaleTime()
.range([7, width-7])
.domain([0,100])

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
    {country:"Bolivia",group:"",alpha:"BOL"},
    {country:"Argentina",alpha:"ARG"},
    {country:"Colombia",alpha:"COL"},
    {country:"Iraq",alpha:"IRQ"},
    {country:"Philippines",alpha:"PHL"},
    {country:"Panama",alpha:"PAN"},
    {country:"Kuwait",alpha:"KWT"},
    {country:"China",alpha:"CHN"},
    {country:"Oman",alpha:"OMN"},

    {country:"Ecuador",alpha:"ECU"},
    {country:"Qatar",alpha:"QAT"},
    {country:"Peru",alpha:"PER"},
    

    {country:"Dominican Republic",alpha:"DOM"},
    {country:"Chile",alpha:"CHL"},
    {country:"India",alpha:"IND"},
    {country:"South Africa",alpha:"ZAF"},
    {country:"Portugal",alpha:"PRT"},
    {country:"Brazil",alpha:"BRA"},
    {country:"Egypt",alpha:"EGY"},

    {country:"Mexico",alpha:"MEX"},
    {country:"Russia",alpha:"RUS"},
    {country:"United Kingdom",alpha:"GBR"},
    {country:"Ireland",alpha:"IRL"},
    {country:"Afghanistan",alpha:"AFG"},

    {country:"Germany",alpha:"DEU"},
    {country:"Ukraine",alpha:"UKR"},
    {country:"US",alpha:"USA"},
    {country:"Switzerland",alpha:"CHE"},
    {country:"Bangladesh",alpha:"BGD"},
    {country:"France",alpha:"FRA"},
    {country:"Sweden",alpha:"SWE"},
    {country:"Iran",alpha:"IRN"},
    {country:"Indonesia",alpha:"IDN"},
    {country:"Saudi Arabia",alpha:"SAU"},

    {country:"Turkey",alpha:"TUR"},
    {country:"Belgium",alpha:"BEL"},
    {country:"Canada",alpha:"CAN"},
    {country:"Poland",alpha:"POL"},
    {country:"Pakistan",alpha:"PAK"},
    {country:"United Arab Emirates",alpha:"ARE"},
    {country:"Belarus",alpha:"BLR"},
    {country:"Italy",alpha:"ITA"},
    {country:"Spain",alpha:"ESP"},
    {country:"Singapore",alpha:"SGP"},
    {country:"Netherlands",alpha:"NLD"}
  
  
  
  
  
  
  
  
  
  
  
  
 
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  ]


loadJson('<%= path %>/stringency_data/stringency.json')
.then(casesRaw => {

     

      isoDict.map(entry => {

            let alpha = entry.alpha

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

           /* countryObj.map((date,i) => {

                  let weekData = countryObj.slice(i,i+7);

                  console.log(weekData)


                  let weekly = d3.sum(weekData , s => s.new ) / weekData.length;

                  date.weekly = weekly;


                  console.log(date.weekly)
            })*/

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


let key1 = d3.select("#interactive-slot-1").append('div')
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


let key2 = d3.select("#interactive-slot-2").append('div')
.attr('class', 'key-container');

key2.append('p').html('No measures')

key2
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
key2.append('p').html('Total lockdown')


let key3 = d3.select("#interactive-slot-3").append('div')
.attr('class', 'key-container');

key3.append('p').html('No measures')

key3
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
key3.append('p').html('Total lockdown')


let key4 = d3.select("#interactive-slot-4").append('div')
.attr('class', 'key-container');

key4.append('p').html('No measures')

key4
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
key4.append('p').html('Total lockdown')


let key5 = d3.select("#interactive-slot-5").append('div')
.attr('class', 'key-container');

key5.append('p').html('No measures')

key5
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
key5.append('p').html('Total lockdown')


let key6 = d3.select("#interactive-slot-6").append('div')
.attr('class', 'key-container');

key6.append('p').html('No measures')

key6
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
key6.append('p').html('Total lockdown')






const makeChart = (alpha, countryObj) =>{

      let div


      let match = isoDict.find(iso => iso.alpha === alpha)

      let stringency = countryObj[countryObj.length-1].stringency;


      let sumThisWeek = d3.sum(countryObj.slice(countryObj.length-7, countryObj.length), s => s.new)
      let sumLastWeek = d3.sum(countryObj.slice(countryObj.length-14, countryObj.length-7), s => s.new)

      //console.log('tw: ', countryObj.slice(countryObj.length-7, countryObj.length), 'lw: ',countryObj.slice(countryObj.length-14, countryObj-7))

      let variation = ((sumThisWeek - sumLastWeek) / sumThisWeek) * 100

      let date

      let cases = 0;
            for (var i = countryObj.length-1; i >=0; i--) {
              cases = countryObj[i].cases;

              date = countryObj[i].date

              if(cases != null) break
            }



      /*
Groupings                       Stringency criteria   Cases criteria
Rising despite lockdown Above   80                    Above 0
Lockdown flattening curve Above 80                    Below 0
Cautious as cases rise          70-80                 Above 0
Cautious as cases fall          70-80                 Below 0
Relaxed and resurgent Below     70                    Above 0
Relaxed and recovering  Below   70                    Below 0*/


      if(stringency >= 80 && variation > 0)  div = d3.select("#interactive-slot-1").append('div').attr('class', 'gv-chart-wrapper ' + alpha );
      if(stringency >= 80 && variation < 0)  div = d3.select("#interactive-slot-2").append('div').attr('class', 'gv-chart-wrapper ' + alpha )
      if(stringency >= 70 && stringency < 80 && variation > 0) div = d3.select("#interactive-slot-3").append('div').attr('class', 'gv-chart-wrapper ' + alpha )
      if(stringency >= 70 && stringency < 80 && variation < 0) div = d3.select("#interactive-slot-4").append('div').attr('class', 'gv-chart-wrapper ' + alpha )
      if(stringency <= 70 && variation > 0) div = d3.select("#interactive-slot-5").append('div').attr('class', 'gv-chart-wrapper ' + alpha )
      if(stringency <= 70 && variation < 0) div = d3.select("#interactive-slot-6").append('div').attr('class', 'gv-chart-wrapper ' + alpha )


        let tw = div.append('div')
        .attr('class', 'sm-tooltip-wrapper')

        tw.append('div')
        .attr('class', 'sm-tooltip ' + alpha)
        .append('div')
        .attr('class', 'sm-tooltip-text ' + alpha)

     /* switch(match.group)
      {
            case 'Rising despite lockdown':
            div = d3.select("#interactive-slot-1").append('div')
            .attr('class', 'gv-chart-wrapper');
            break;

            case 'Lockdown flattening curve':
            div = d3.select("#interactive-slot-2").append('div')
            .attr('class', 'gv-chart-wrapper')
            break;

            case 'Cautious as cases rise':
            div = d3.select("#interactive-slot-3").append('div')
            .attr('class', 'gv-chart-wrapper')
            break;

            case 'Cautious as cases fall':
            div = d3.select("#interactive-slot-4").append('div')
            .attr('class', 'gv-chart-wrapper')
            break;

            case 'Relaxed and resurgent':
            div = d3.select("#interactive-slot-5").append('div')
            .attr('class', 'gv-chart-wrapper')
            break;

            case 'Relaxed and recovering':
            div = d3.select("#interactive-slot-6").append('div')
            .attr('class', 'gv-chart-wrapper')
            break;
      }
*/

            let head = div.append("h3")
            .html(match.country)
            
            if(cases)
            {
              let subhead = div.append("p")
              .attr('class', 'subhead')
              .html('Total cases: ' + numberWithCommas(cases))
            }

            let sign = variation > 0 ? '+' : ''

            let formatDecimalComma = d3.format(",.1f");

            let subhead2 = div.append("p")
            .attr('class', 'subhead')
            .html(sign + formatDecimalComma(variation) + '% vs last week' )

            let svg = div.append("svg")
            .attr('id', 'gv-cases-chart-' + alpha)
            .attr("width", width)
            .attr("height", height)


            svg.append('g')
            .selectAll('rect')
            .data(countryObj)
            .enter()
            .append('rect')
            .attr('class', (d,i) => 'area-chart ' + d.country + i)
            .attr('x', d => xScale(d.date) - (width / day)) 
            .attr('y', d => yScale(d.new))
            .attr('width', width / day)
            .attr('height', d => height - marginBottom - yScale(d.new))


              svg.append('g')
              .selectAll('rect')
              .data(countryObj)
              .enter()
              .append('rect')
              .attr('x', d => xScale(d.date) - (width / day)) 
              .attr('y', 0)
              .attr('width', 5)
              .attr('height', height)
              .attr('opacity', 0)
              .on('mouseover', (d,i) => manageOver(d.country + i, alpha, d.new, ' Stringency: ' + formatDecimalComma(d.stringency)) )
              .on('mouseout', (d,i) => manageOut(d.country + i, alpha))
              .on('mousemove', d => manageMove(alpha))
            

            svg.append("g")
            .selectAll('rect')
            .data(countryObj)
            .enter()
            .append('rect')
            .attr('width', 5)
            .attr('class', d => d.date)
            .attr('height', 10)
            .attr('x', d => xScale(d.date) - (width / day)) 
            .attr('y', height - marginBottom)
            .attr('fill', d => {

                  return colorScale(d.stringency)
            
            })

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
            .attr('midtext')

            const xAxis = svg.append("g")
            .call(d3.axisBottom(xScale)
                  .ticks(d3.timeMonth)
                  .tickFormat(d3.timeFormat("%b"))
            )
            .attr('transform', 'translate(' + 0 + ',' + (height - marginBottom + 7) + ')')

            xAxis.selectAll(".tick text")
            .attr('class', 'tick-text')
            
            xAxis.selectAll(".tick line")
            .attr('class', 'tick-line')
            .attr('y1', 3)  
            .attr('y2', 8);

            yAxis.selectAll("text")
            .attr('class', 'tick-text')

            svg.selectAll(".domain").remove();




            
}

const manageOver = (bar, alpha, cases, stringency) => {

  d3.select('.' + bar).style('fill', '#333333')


  if(cases)
  {
    d3.select('.sm-tooltip.' + alpha).style('display', 'block')
  }

  

  d3.select('.sm-tooltip-text.' + alpha).html(numberWithCommas(cases) + ' new cases <br>' + stringency)

}

const manageOut = (bar, alpha) => {

  d3.select('.' + bar).style('fill', '#eaeaea')

  d3.select('.sm-tooltip.' + alpha).style('display', 'none')

  d3.select('.sm-tooltip-text.' + alpha).html('')
  
}

const manageMove = (alpha) => {


    let here = d3.mouse(d3.select('.gv-chart-wrapper.' + alpha).node());
    let left = here[0];
    let top = here[1];
    let tHeight = d3.select('.sm-tooltip.' + alpha).node().getBoundingClientRect().height;
    let tWidth = d3.select('.sm-tooltip.' + alpha).node().getBoundingClientRect().width;

    let posX = left;

    if(posX + tWidth > width)posX = width - tWidth


    d3.select('.sm-tooltip.' + alpha).style('left',  posX + 'px')
    d3.select('.sm-tooltip.' + alpha).style('top', 60 + 'px')

  
}
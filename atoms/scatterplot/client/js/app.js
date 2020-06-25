//import fs from 'fs'
import * as d3 from 'd3'
import { numberWithCommas } from 'shared/js/util'
import $ from 'shared/js/util'
import loadJson from 'shared/js/load-json'
import moment from 'moment'

let isMobile = window.matchMedia('(max-width: 700px)').matches;
let isDesktop = window.matchMedia('(min-width: 1200px)').matches;

const atomEl = d3.select('.scatterplot-chart-container').node();

let width = atomEl.getBoundingClientRect().width;
let height =  isMobile ? width * 2.5 / 3 :  width * 2.5 / 4;

const parseTime = d3.timeParse("%Y-%m-%d");

let startEndDates;

let marginBottom = 30;

let xScale = d3.scaleLinear()
.range([10, width-20])
.domain([0,100])

let colorScale = d3.scaleLinear()
.domain([0,1,2,3,4,5])
.range(['#ffe500', '#00b2ff', "#ed6300", "#951d7a", '#ff1921', '#004e3a']);

let yScale = d3.scaleLinear()
.range([height - marginBottom, 1])
.domain([-100,100])

/*let arrowY = d3.select('.scatterplot-chart-container')
.append('div')
.attr('class', 'arrow-container-yaxis');

arrowY
.append('div')
.attr('class','arrow')
.html(`<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
   viewBox="0 0 5px 24.9px" width="5px" height="20px" style="enable-background:new 0 0 5 24.9;" xml:space="preserve">
<polygon points="5,4.3 2.5,0 0,4.3 2,4.3 2,24.9 3,24.9 3,4.3 "/>
</svg>`)

arrowY
.append('p')
.attr('class','text')
.html('% change in new weekly cases')*/

let svg = d3.select('.scatterplot-chart-container').append("svg")
.attr('id', 'gv-scatterplot-chart')
.attr("width", width)
.attr("height", height)

let yaxis = svg.append("g")
  .attr("class", "yaxis")
  .call(
    d3.axisLeft(yScale)
    .ticks(5)
    .tickSizeInner(-width)
    )
  .selectAll("text")
  .style("text-anchor", "start")
  .attr('x', 10)
  .attr('y', -10);

//let zeroLine = d3.selectAll('.yaxis .tick').nodes()[3].firstChild.style('stroke', 'red')



let tickPos = null
d3.selectAll('.yaxis text').nodes().map( (t,i) => {

  if(t.innerHTML == '0')  tickPos = i

})

let lineNode = d3.selectAll('.yaxis line').nodes()[tickPos];
let zeroNode = d3.selectAll('.yaxis text').nodes()[tickPos];

d3.select(lineNode).style('stroke', '#333333')
d3.select(zeroNode).style('fill', '#333333')

 d3.select(".yaxis .domain").remove();

  let xaxis = svg.append("g")
    .attr("transform", "translate(0," + (height - 25) + ")")
    .attr("class", "xaxis")
    .call(
      d3.axisBottom(xScale)
      .ticks(5)
      //.tickFormat(formatYears)
      )
    .selectAll("text")
    .attr('y', 10);

let arrowX = d3.select('.scatterplot-chart-container')
.append('div')
.attr('class', 'arrow-container-xaxis');


let arrowLeft = arrowX
.append('div')
.attr('class', 'arrow-container-xaxis-left');

let arrowRight = arrowX
.append('div')
.attr('class', 'arrow-container-xaxis-right');

arrowLeft
.append('p')
.attr('class','text2')
.html('No meassures')

arrowLeft
.append('div')
.attr('class','arrow2')
.html(`<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
   viewBox="0 0 24.9px 5px" width="25px" height="5px" style="enable-background:new 0 0 24.9 5;" xml:space="preserve">
<polygon points="0,2.5 4.3,5 4.3,3 24.9,3 24.9,2 4.3,2 4.3,0 "/>
</svg>`)

arrowRight
.append('div')
.attr('class','arrow')
.html(`<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
   viewBox="0 0 24.9px 5px" width="24.9px" height="5px" style="enable-background:new 0 0 24.9 5;" xml:space="preserve">
<polygon points="24.9,2.5 20.6,0 20.6,2 0,2 0,3 20.6,3 20.6,5 "/>
</svg>`)

arrowRight
.append('p')
.attr('class','text')
.html('Full lockdown')








let ticks = d3.selectAll('.yaxis .tick').nodes()

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

let countries = [];

loadJson('<%= path %>/stringency_data/stringency.json')
.then(casesRaw => {


  console.log(casesRaw)

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
                              date:dates.date,
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

            

            let countryData = countryObj.slice(countryObj.length-14, countryObj.length);


            countries.push({alpha:alpha, countryData:countryData})
      })

      countries.sort((a,b) => (b.countryData[11].cases > a.countryData[11].cases) ? 1 : ((a.countryData[11].cases > b.countryData[11].cases) ? -1 : 0))

      countries.map(c => {

        makeCountry(c.alpha, c.countryData)

        if(c.alpha == 'DEU' && width > 400)
        {
          makeAnnotation(c.countryData)
        }

      })
})


const makeAnnotation = (germany) => {


  let sumThisWeek = d3.sum(germany.slice(7, 14), s => s.new)
  let sumLastWeek = d3.sum(germany.slice(0, 7), s => s.new)


  let variation = ((sumThisWeek - sumLastWeek) / sumThisWeek) * 100;

  let ann = svg
  .append("text")
  .attr("class", "annotation")
  .attr("x", d => xScale(germany[13].stringency) - 155)
  .attr("y", d => yScale(variation) - 30 )
  .text("Germany is among the countries to see cases rising after relaxing their lockdowns")
  .call(wrap, 120);


  let line = d3.line()([[xScale(germany[13].stringency) - 10, yScale(variation)], [ xScale(germany[13].stringency) - 20, yScale(variation)], [xScale(germany[13].stringency) - 30, yScale(variation)]])

  svg
  .append('path')
  .attr('d', line)
  .attr('stroke', '#333333')
  .attr('stroke-width', 1.5)


}

function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = text.text(null)
                        .append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
            }
        }
    });
}


const makeCountry = (alpha, countryData) => {

  let sumThisWeek = d3.sum(countryData.slice(7, 14), s => s.new)
  let sumLastWeek = d3.sum(countryData.slice(0, 7), s => s.new)


  let variation = ((sumThisWeek - sumLastWeek) / sumThisWeek) * 100;

  let stringency = countryData[countryData.length-1].stringency;

let date

 let cases = 0;
  for (var i = countryData.length-1; i >=0; i--) {
        cases = countryData[i].cases;

        date = countryData[i].date

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

let colour = '#ffffff'

if(stringency >= 80 && variation > 0) colour = colorScale(0)
if(stringency >= 80 && variation < 0)colour = colorScale(1)
if(stringency >= 70 && stringency < 80 && variation > 0)colour = colorScale(2)
if(stringency >= 70 && stringency < 80 && variation < 0)colour = colorScale(3)
if(stringency <= 70 && variation > 0)colour = colorScale(4)
if(stringency <= 70 && variation < 0)colour = colorScale(5)


  let radius = d3.scaleSqrt()
  .range([0, 30])
  .domain([0, 2300000]);


  let circle = svg
  .append('circle')
  .attr('class', alpha)
  .attr('r', radius(cases))
  .attr('cx', xScale(stringency))
  .attr('cy', yScale(variation))
  .attr('fill-opacity', 0.5)
  .attr('fill', colour)
  .attr('stroke', colour)
  .attr('stroke-width', '2px')
  .on('mouseover', d => manageOver(alpha, variation, cases, stringency, date))
  .on('mouseout', d => manageOut(alpha, colour))
  .on('mousemove', d => manageMove())

  
  //console.log(countryData, stringency, sumThisWeek, sumLastWeek, variation)

}

const manageOver = (alpha, variation, cases, stringency, date) => {

  d3.select('.tooltip').classed(' over', true)
  d3.select('.' + alpha).attr('stroke', 'black')

  let current = countries.find(c => c.alpha === alpha)

  let mf = d3.timeFormat("%B")
  let df = d3.timeFormat("%d")

  let name = isoDict.find(c => c.alpha === alpha).country;

  if(name == 'United Arab Emirates')name = 'UAE'

  //let date = mf(parseTime(current.countryData[13].date)) + ' ' + df(parseTime(current.countryData[13].date));

  let formatDecimalComma = d3.format(",.1f");

  let sign = variation > 0 ? '+' : ''

  d3.select('.tooltip-country').html(name)
  d3.select('.tooltip-variation').html('Weekly cases ' + sign + formatDecimalComma(variation) + "% vs last week")
  d3.select('.tooltip-stringency').html('Stringency: ' + formatDecimalComma(stringency))
}


const manageOut = (alpha, colour) => {
  d3.select('.tooltip').classed(' over', false)

  d3.select('.' + alpha).attr('stroke', colour)
}

const manageMove = () => {

    let here = d3.mouse(d3.select('.interactive-wrapper').node());
    let left = here[0];
    let top = here[1];
    let tHeight = d3.select('.tooltip').node().getBoundingClientRect().height;
    let tWidth = d3.select('.tooltip').node().getBoundingClientRect().width;

    let posX = left > width / 2 ? (left - tWidth - 5) : (left  + 5)
    let posY = top > height / 2 ? (top - tHeight - 5) : (top  + 5)


    d3.select(".tooltip").style('left',  posX + 'px')
    d3.select(".tooltip").style('top', posY + 'px')

  
}
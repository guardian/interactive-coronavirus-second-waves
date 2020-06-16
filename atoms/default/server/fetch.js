import fs from 'fs'
import moment from 'moment'
import csvParse from 'csv-parse/lib/sync'
import * as d3 from 'd3'
import jhudaily from 'shared/js/jhudaily'
import fetchstringency from 'shared/js/fetchstringency'
// Add alpha3 codes to this array to add them to the loop
const isoDict = [
  { country: "Spain", alpha: "ESP", file: 'ESP1', tickVals: [0, 5000, 10000, 15000]},
  { country: "Denmark", alpha: 'DNK', file: 'DNK2', tickVals: [0, 300, 600, 900 ]},
  { country: "Finland", alpha: 'FIN', file: 'FIN1', tickVals: []},
  { country: "Sweden", alpha: "SWE", file: 'SWE1', tickVals: [0, 800, 1600, 2400]},
  { country: "Portugal", alpha: "PRT", file: 'PRT1', tickVals: []},
  { country: "Norway", alpha: "NOR", file: 'NOR1', tickVals: []},
  { country: "Netherlands", alpha: "NLD", file: 'NLD1', tickVals: [0,1500, 3000, 4500 ]},
  { country: "Iceland", alpha: "ISL", file: 'ISL1', tickVals: []},
  { country: "Austria", alpha: "AUT", file: 'AUT1', tickVals: [0, 500, 1000, 1500]},
  { country: "Germany", alpha: "DEUTNP", file: 'DEUTNP1', tickVals: [0, 6000, 12000, 18000]},
  { country: "US", alpha: "USA", file: 'USA_cdc', tickVals: [0, 20000, 40000, 60000]},
  { country: 'Belgium', alpha: 'BEL', file: 'BEL1', tickVals: [0, 1200, 2400, 3600 ]},
  { country: 'Italy', alpha: 'ITA', file: 'ITA_economist', tickVals: [0, 6000, 12000, 18000]},
  { country: 'France', alpha: 'FRA', file: 'FRA_economist', tickVals: [0, 6000, 12000, 18000]},
  { country: 'UK', alpha: 'GBR', file: 'UK-CB', tickVals: [0, 8000, 16000, 24000]}
]
const ourcountries = ["Spain", "Denmark", "Sweden", "Netherlands", "Austria", "Germany", "US", 'Belgium', 'Italy', 'France',"UK"]

// const ourcountries = ["US"]


// const codes = Object.keys(isoDict).filter(k => ourcountries.includes(k)).map(d => isoDict[d])
const codes = isoDict.filter(d => ourcountries.includes(d.country))
/** helper functions **/

// get array of days between two dates
const getDates = (start, end) => {
  for (var arr = [], dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
    arr.push(moment(new Date(dt)).format('M/DD/YY'));
  }
  return arr;
};
// get the reported daily deaths from json and stringency
const getDailyReported = (alphaCode) => JSON.parse(fs.readFileSync(`./assets/reported_data/${alphaCode}.json`, 'utf-8'))
const getDailyStringency = (alphaCode) => JSON.parse(fs.readFileSync(`./assets/stringency_data/${alphaCode}.json`, 'utf-8'))
// Add up the reported daily deaths into single week days
const groupWeekly = (data, startDate) => {
  const weeklyData = []
  const startIndex = data.findIndex(d => new Date(d.date).getTime() === new Date(startDate).getTime())
  const sliced = data.slice(startIndex)
  let weeksDeaths = 0

  sliced.forEach((d, i) => {
    const index = i + 1

    if (index % 7 !== 0) {
      weeksDeaths += d.value
    } else {
      weeksDeaths += d.value
      weeklyData.push({
        date: d.date,
        value: weeksDeaths
      })
      weeksDeaths = 0
    }
  })

  return weeklyData
}

const groupStringency = countryData => {
  if (countryData.length > 0) {
    let endOfWeeks = []
    countryData
      .slice(4) //remove days before last day of first week of jan
      .forEach((d, i) => {
        const index = i + 1
        const isLastDayOfWeek = index % 7 === 0

        if (isLastDayOfWeek || index === 1) {
          endOfWeeks.push(d)
        }
      })
    return endOfWeeks.map((d, i) => {
      d.week = i + 1
      return d
    })
  } else {
    return []
  }
}

// make dictionary to avoid .find() when matching
const toDict = (arr, key) => {
  const out = {}
  arr.forEach(o => out[o[key]] = o)

  return out
}

const nestByYear = (arr) => d3.nest()
  .key(d => d['year'])
  .entries(arr)

const nestByWeek = (arr) => d3.nest()
  .key(d => d['week'])
  .entries(arr)


// first step of parsing MPI data
const parseData = (alphaCode) =>
  csvParse(fs.readFileSync(`./assets/mp_data/${alphaCode}.csv`), { columns: true })
    .filter(d => d['Sex'] === 'b') //only keep deaths of both sexes
    .map(d => ({
      place: d['Country'],
      year: Number(d['Year']),
      week: Number(d['Week']),
      // age: d['Age'],
      sex: d['Sex'],
      total_deaths: Number(d['Deaths']//.replace(/\./g, "")
      )
    }))

const addTotals = (alphaCode) => parseData(alphaCode)

const addTotalsForAverages = (alphaCode) => nestByYear(parseData(alphaCode))
  .map(yearObj => {
    const byWeek = nestByWeek(yearObj.values).map(obj => {
      const calcTotalDeaths = obj.values.filter(v => v.age !== 'TOT').map(v => v.deaths).reduce((a, b) => Number(a) + Number(b))
      const totalDeathsObj = obj.values.find(v => v.age === 'TOT')

      obj.place = obj.values[0].place,
        obj.year = obj.values[0].year,
        obj.week = obj.values[0].week,
        obj.total_deaths = totalDeathsObj ? totalDeathsObj.deaths : null,
        obj.calc_deaths = calcTotalDeaths

      delete obj.values
      delete obj.key

      return obj
    })

    yearObj.values = byWeek //.map(d => d.values)
    return yearObj
  }
  )
  // get all years for averages
  //.filter(d => d.key === '2019' || d.key === '2020')
  .map(d => d.values).flat()


const getAverages = (historic) => {
  var lastfiveyears = historic.filter(d => d.year > 2014 && d.year < 2020)
  var weeks = d3.nest().key(d => d.week).entries(lastfiveyears)
  weeks = weeks.map(w => {
    w.average = d3.mean(w.values, d => d.total_deaths)
    return w
  })
  const withAverages = historic.map(d => {
    var matchingweek = weeks.find(w => w.key == d.week);
    if (matchingweek != undefined) {
      d.average_deaths = matchingweek.average;
    }
    return d;
  })
  return withAverages;
}

//third step
//merge the datasets for the same country, reported + historical. I've added average as a param as I plan to merge it in at this stage if we get it from the data team.
const mergeData = (reported, historic, weekStringency) => {
  const reportedDict = toDict(reported, 'week') // this will always only contain 2020, so weeks in here are unique
  const stringencyDict = weekStringency.length > 0 ? toDict(weekStringency, 'week') : null

  const merged = historic.map(d => {
    if (d.year === 2020) {
      const match = reportedDict[String(d.week)]

      if (stringencyDict) {
        const stringencyMatch = stringencyDict[String(d.week)]

        if (stringencyMatch) {
          d.stringency = stringencyMatch.stringency
          d.stringency_actual = stringencyMatch.stringency_actual
        } else {
          d.stringency = null
          d.stringency_actual = null
        }
      }

      // add unreported deaths. if totals are missing, use my totals instead
      if (match) {
        d.rep_deaths = match.rep_deaths
        if (d.total_deaths) {
          // d.unreported = d.total_deaths - match.rep_deaths
        } else {
          // d.unreported = d.calc_deaths - match.rep_deaths
        }
      } else {
        d.rep_deaths = null
        // d.unreported = null
      }
    }
    return d
  })

  return merged
}
/*---------------------------------actual parsing starts here--------------------------------------*/


async function run() {
  await jhudaily(ourcountries)
  //sync loop
  await fetchstringency(codes.map(c => c.alpha === 'DEUTNP' ? 'DEU' : c.alpha))

  let mega = []
  // let files = codes.map(c => c.file)

  for (const obj of codes) {
    //read historic MPI data csv and parse it
    const code = obj.file
    const alpha = obj.alpha
    const tickVals = obj.tickVals
    // const historic = addTotals(code)
    const historic = addTotals(code)
    // const allyears = addTotalsForAverages(code)

    historic = getAverages(historic)



    //read reported json
    const dailyReported = getDailyReported(alpha)

    //read stringency for this country
    const dailyStringency = getDailyStringency(alpha)
    const weeklyStringency = groupStringency(dailyStringency)


    // Add missing days from the first day of last week of 2019 till the first day in the daily deaths data
    const fullReported = getDates(new Date('2019-12-23'), new Date(dailyReported[0].date))
      .map(d => ({ date: d, value: 0 }))
      .slice(0, -1)
      .concat(dailyReported)

    // add up days into weeks and add week number
    const reportedWeekly = groupWeekly(fullReported, '12/30/19') // the second param is when you start counting the weeks (first day of last week of the year)
      .map((d, i) => {
        d.rep_deaths = d.value; // our naming for reported covid deaths from now on
        d.week = i + 1 // add week information to have consistency with MP data
        delete d.value
        return d
      })

    //merge the two datasets
    const merged = mergeData(reportedWeekly, historic, weeklyStringency)
      .filter(d => d.year === 2020)
      .map(d => {
        const totalDeaths = d.total_deaths ? d.total_deaths : d.calc_deaths
        d.diff_deaths = totalDeaths - d.rep_deaths
        return d
      })
      .sort((a, b) =>
        a.week < b.week ? -1 : 1
      )

    mega.push({ code: alpha,  tickVals, data: merged })
    //write output for country
    fs.writeFileSync(`./assets/output/mega.json`, JSON.stringify(mega))
  }
}

run()
import axios from 'axios'
import fs from 'fs'
import moment from 'moment'

const url = `https://covidtrackerapi.bsg.ox.ac.uk/api/v2/stringency/date-range/2020-01-01/2020-06-24}`
//const url = `https://covidtrackerapi.bsg.ox.ac.uk/api/v2/stringency/date-range/2020-01-01/${moment().format('YYYY-MM-DD')}`

async function fetchstringency(countries) {

  const all = (await axios.get(url)).data;
  const data = all.data

  if(data) {

    let datesCountries = []

    Object.keys(data).map(k => {

      let dateObj = {date:k, countries:[]}

      countries.forEach(c =>{

        if(data[k][c])
        {
          let countryObj = {
            name:c,
            stringency:data[k][c].stringency,
            cases:data[k][c].confirmed
          }

          dateObj.countries.push(countryObj)

        }

      })

      datesCountries.push(dateObj)

    })

    fs.writeFileSync(`./assets/stringency_data/stringency.json`, JSON.stringify(datesCountries))
  }
}

export default fetchstringency
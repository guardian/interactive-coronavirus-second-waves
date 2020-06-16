import axios from 'axios'
import fs from 'fs'
import moment from 'moment'

const url = `https://covidtrackerapi.bsg.ox.ac.uk/api/v2/stringency/date-range/2019-01-01/${moment().format('YYYY-MM-DD')}`

async function fetchstringency(countries) {

  const all = (await axios.get(url)).data;
  const data = all.data

   console.log('FETCH')

  if(data) {
    const filteredDates = Object.keys(data).map(k => {

      const currentObj = data[k]

      const filtered = Object.keys(currentObj)
        .filter(key => countries.includes(key))
        .reduce((obj, key) => {
          obj[key] = currentObj[key]
          return obj
        }, {})

      data[k] = filtered

      return filtered
    })

    countries.forEach(c => {

      let countryDates = []

      filteredDates.forEach(d => {
        const match = d[c]

        if (match) {
          countryDates.push(match)
        }
      })

      console.log(JSON.stringify(countryDates))

      fs.writeFileSync(`./assets/stringency_data/${c === 'DEU' ? 'DEUTNP' : c}.json`, JSON.stringify(countryDates))
    })
  }
}

export default fetchstringency
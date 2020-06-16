import mainHTML from "./atoms/default/server/templates/main.html!text"
import fetchstringency from './fetchstringency.js'

export async function render() {

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

	const codes = isoDict.filter(d => ourcountries.includes(d.country))

	fetchstringency(codes.map(c => c.alpha === 'DEUTNP' ? 'DEU' : c.alpha))

    return mainHTML;
} 
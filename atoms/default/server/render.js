import mainHTML from "./atoms/default/server/templates/main.html!text"
import fetchstringency from './fetchstringency.js'

export async function render() {

  const isoDict = [

    {country:"Ireland",alpha:"IRL"},
    {country:"Bolivia",group:"",alpha:"BOL"},
    {country:"Israel",group:"",alpha:"ISR"},
    {country:"United Kingdom",alpha:"GBR"},
    {country:"Singapore",alpha:"SGP"},
    {country:"Lebanon" ,alpha:"LBN"},
    {country:"South Africa",alpha:"ZAF"},
    {country:"Czechia" ,alpha:"CZE"},
    {country:"Honduras" ,alpha:"HND"},
    {country:"Portugal",alpha:"PRT"}
]

	//fetchstringency(isoDict.map(c => c.alpha))

  return mainHTML;
} 
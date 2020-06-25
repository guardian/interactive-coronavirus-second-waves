import mainHTML from "./atoms/default/server/templates/main.html!text"
import fetchstringency from './fetchstringency.js'

export async function render() {

  const isoDict = [
  {country:"Spain",alpha:"ESP"},
  {country:"Colombia",alpha:"COL"},
  {country:"Chile",alpha:"CHL"},
  {country:"China",alpha:"CHN"},
  {country:"Iraq",alpha:"IRQ"},
  {country:"Ukraine",alpha:"UKR"},
  {country:"Argentina",alpha:"ARG"},
  {country:"South Africa",alpha:"ZAF"},
  {country:"US",alpha:"USA"},
  {country:"India",alpha:"IND"},
  {country:"Brazil",alpha:"BRA"},
  {country:"Portugal",alpha:"PRT"},
  {country:"Pakistan",alpha:"PAK"},
  {country:"Poland",alpha:"POL"},
  {country:"United Kingdom",alpha:"GBR"},
  {country:"Belarus",alpha:"BLR"},
  {country:"Mexico",alpha:"MEX"},
  {country:"Italy",alpha:"ITA"},
  {country:"Dominican Republic",alpha:"DOM"},
  {country:"United Arab Emirates",alpha:"ARE"},
  {country:"Ecuador",alpha:"ECU"},
  {country:"Philippines",alpha:"PHL"},
  {country:"Egypt",alpha:"EGY"},
  {country:"France",alpha:"FRA"},
  {country:"Panama",alpha:"PAN"},
  {country:"Afghanistan",alpha:"AFG"},
  {country:"Kuwait",alpha:"KWT"},
  {country:"Russia",alpha:"RUS"},
  {country:"Oman",alpha:"OMN"},
  {country:"Netherlands",alpha:"NLD"},
  {country:"Belgium",alpha:"BEL"},
  {country:"Sweden",alpha:"SWE"},
  {country:"Germany",alpha:"DEU"},
  {country:"Canada",alpha:"CAN"},
  {country:"Saudi Arabia",alpha:"SAU"},
  {country:"Turkey",alpha:"TUR"},
  {country:"Ireland",alpha:"IRL"},
  {country:"Qatar",alpha:"QAT"},
  {country:"Switzerland",alpha:"CHE"},
  {country:"Bangladesh",alpha:"BGD"},
  {country:"Peru",alpha:"PER"},
  {country:"Iran",alpha:"IRN"},
  {country:"Indonesia",alpha:"IDN"},
  {country:"Singapore" ,alpha:"SGP"},
  {country:"Bolivia" ,alpha:"BOL"}
  ]





  const ourcountries = [
"Spain",
"Colombia",
"Chile",
"China",
"Iraq",
"Ukraine",
"Argentina",
"South Africa",
"US",
"India",
"Brazil",
"Portugal",
"Pakistan",
"Poland",
"United Kingdom",
"Belarus",
"Mexico",
"Italy",
"Dominican Republic",
"United Arab Emirates",
"Ecuador",
"Philippines",
"Egypt",
"France",
"Panama",
"Afghanistan",
"Kuwait",
"Russia",
"Oman",
"Netherlands",
"Belgium",
"Sweden",
"Germany",
"Canada",
"Saudi Arabia",
"Turkey",
"Ireland",
"Qatar",
"Switzerland",
"Bangladesh",
"Peru",
"Iran",
"Indonesia",
"Singapore",
"Bolivia"
  ]

	const codes = isoDict.filter(d => ourcountries.includes(d.country))

	fetchstringency(codes.map(c => c.alpha))

  return mainHTML;
} 
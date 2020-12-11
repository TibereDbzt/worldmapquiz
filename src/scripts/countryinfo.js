import 'handlebars'
import $ from 'jquery'
import { formatPopulation } from './helpers/formatpopulation'
const template = require('./templates/countryinfo.hbs');

export default class CountryInfo {

  constructor (country) {
    country.population = formatPopulation(country.population);
    this.data = country;
    this.template = template;
  }

  renderElements () {
    $('.js-country-info').html(this.template(this.data));
    $('.js-country-info').show();
  }

}

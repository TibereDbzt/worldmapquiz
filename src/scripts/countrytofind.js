import $ from 'jquery'

export default class CountryToFind {

  constructor (country) {
    this.name = country.name;
    this.code = country.alpha3Code;
    this.initElements();
    this.renderElements();
  }

  initElements () {
    this.$elements = {
      container : $('.js-to-find'),
      country : $('.js-country'),
      timer : $('.js-timer')
    }
  }

  renderElements () {
    this.$elements.container.removeClass('green red');
    this.$elements.country.text(`find ${this.name}`);
    this.$elements.timer.val('100');
    this.$elements.timer.show();
  }

}

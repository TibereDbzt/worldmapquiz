import $ from 'jquery'
import CountryInfo from './countryinfo'
import CountryToFind from './countrytofind'
import { pickRandom } from './helpers/random'
import { compareAlpha3Code } from './helpers/compare'

export default class Stage {

  constructor (countries, map) {
    this.map = map;
    this.timer = true;
    this.initElements();
    this.picked = pickRandom(countries);
    this.retrieveCountryData(this.picked);
    this.to_find = new CountryToFind(this.picked);
    this.manageTime(this.$elements.timer);
  }

  initElements () {
    this.$elements = {
      container : $('.js-to-find'),
      result : $('.js-result'),
      timer : $('.js-timer')
    }
  }

  retrieveCountryData (country) {
    const code = country.alpha3Code;
    const settings = {
      "async": true,
      "crossDomain": true,
      "url": `https://restcountries.eu/rest/v2/alpha/${code}`,
      "method": "GET",
      success: (response) => {
        this.countryInfo = new CountryInfo(response);
      },
      error: (e) => {
        console.log(e.responseJSON);
      }
    };
    $.ajax(settings);
  }

  manageTime (progress) {
    this.timer = setInterval( () => {
      progress.val( progress.val() - 0.1 );
      if (progress.val() == 0) {
        clearInterval(this.timer);
        this.timer = false;
        this.displayResult('timed out');
        this.countryInfo.renderElements();
      }
    }, 10);
  }

  onClickRegion (region) {
    if (this.timer) {
      clearInterval(this.timer);
      this.clicked = region.id;
      const result = compareAlpha3Code(this.clicked, this.picked.alpha3Code);
      this.displayResult(result);
      this.countryInfo.renderElements();
    }
  }

  displayResult(result) {
    this.$elements.timer.hide();
    switch (result) {
      case 'correct' :
        this.$elements.container.addClass('green');
        this.$elements.result.text('correct !');
        eval(this.revealCountry(this.picked.alpha3Code, '#0e844e'));
        break;
      case 'wrong' :
        this.$elements.container.addClass('red');
        this.$elements.result.text('wrong');
        eval(this.revealCountry(this.picked.alpha3Code, '#a63338'));
        break;
      case 'timed out' :
        this.$elements.container.addClass('red');
        this.$elements.result.text('timed out');
        eval(this.revealCountry(this.picked.alpha3Code, '#a63338'));
    }
    $('.js-continue').show();
  }

  revealCountry (alpha3Code, color) {
    return `this.map.updateChoropleth({
      ${alpha3Code}: '${color}'
    });`
  }

}

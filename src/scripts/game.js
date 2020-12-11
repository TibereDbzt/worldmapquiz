import $ from 'jquery'
import Datamap from './../../node_modules/datamaps/dist/datamaps.world.min.js'
import './../styles/layouts/game.sass'
import './../styles/main.sass'
import './../styles/components/country-info.sass'
import './../styles/components/country-tofind.sass'
import Stage from './stage'

export default class Game {

  constructor () {
    this.retrieveListOfCountries();
    this.makeMap();
    this.clearDocument();
    this.nextStage();
  }

  retrieveListOfCountries () {
    const settings = {
      "async": true,
      "crossDomain": true,
      "url": "https://restcountries.eu/rest/v2/all?fields=alpha3Code;name",
      "method": "GET",
      success: (response) => {
        this.countries = response;
        this.stage = new Stage(this.countries, this.map);
      },
      error: (e) => {
        console.log(e.responseJSON);
      }
    }
    $.ajax(settings);
  }
  
  makeMap () {
    this.map = new Datamap({
      element: document.getElementById('container'),
      fills: {
        defaultFill: 'black'
      },
      setProjection: (element) => {
        const projection = d3.geo.equirectangular()
          .center([20, 20])
          .rotate([4.4, 0])
          .scale(300)
          .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
        const path = d3.geo.path()
          .projection(projection);
    
        return {path: path, projection: projection};
      },
      geographyConfig: {
        highlightOnHover: true,
        popupOnHover: false
      },
      done: (datamap) => {
        datamap.svg.selectAll('.datamaps-subunit').on('click', (geography) => {
          this.stage.onClickRegion(geography);
        });
      }
    });

    
  }

  nextStage () {
    $('.js-continue').click( () => {
      this.clearDocument();
      this.map.updateChoropleth(null, {reset: true});
      this.stage = new Stage(this.countries, this.map);
    } )
  }

  clearDocument () {
    $('.js-country-info').hide();
    $('.js-continue').hide();
  }

}

new Game();

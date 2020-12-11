import $ from 'jquery';
import '../styles/main.sass';
import '../styles/layouts/home.sass';

export default class Home {

  constructor () {
    this.initElements();
    this.animateMenu(this.$elements);
  }

  initElements () {
    this.$elements = {
      menu: $('.menu'),
      marker: $('img.marker'),
      entries : {
        play: $('.menu li.to-play'),
        maps: $('.menu li.to-maps'),
        settings: $('.menu li.to-settings')
      }
    };
  }

  animateMenu (obj) {
    const menu = obj.menu;
    const marker = obj.marker;
    const entries = obj.entries;

    $(menu).hover(
      // Event when the mouse pointer enters the element
      () => {
        $(marker).removeClass('hidden');
        $.each(entries, (index, entry) => {
          $(entry).mouseover( () => {
            const posY = $(entry).position().top + $(entry).height()/2 + 13;
            marker.css('top', posY);
          })
        })
      },
      // Event when the mouse pointer leaves the element
      () => {
        $(marker).addClass('hidden');
      }
    );
  }

}

new Home();

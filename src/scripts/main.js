(function() {
  'use strict';
  
  class MobileSlider {
    constructor(el) {
      this.sliderEl = el;
      this.slideCount = 0;
      this.activeSlide = 0;
      this.touchstartX = 0;
      this.touchendX = 0;
      this.onEnd = this.onEnd.bind(this);
      this.onStart = this.onStart.bind(this);
      this.goTo = this.goTo.bind(this);
      this.upDatePagination = this.upDatePagination.bind(this);
      this.goToSlide = this.goToSlide.bind(this);
      this.sliderPanelSelector = '.carousel__box';
      this.sliderPaginationSelector = '.carousel__bullets';
      this.slideLinks = document.querySelectorAll('.carousel__wrap a');
      this.carouselBullets = document.querySelectorAll('.carousel__bullets > a');
      this.slideCount = this.sliderEl.querySelectorAll(
        this.sliderPanelSelector
      ).length;
      this.sliderEl.style.width = 100 * this.slideCount + '%';

      Array.from(
        this.sliderEl.querySelectorAll(this.sliderPanelSelector)
      ).forEach(e => {
        e.style.display = 'block';
        e.style.opacity = 1;
      });

      let goToSlide = this.goToSlide;
      for (let n = 0; n < this.slideCount; n++) {
        let bullet = document.createElement('a');
        if (n == this.activeSlide) bullet.setAttribute('class', 'active')
        bullet.setAttribute('data-pos', n);
        bullet.addEventListener('click', function() {
          let pos = parseInt(this.dataset.pos);
          goToSlide(pos);
        });

        this.sliderEl.parentElement.querySelector(
          this.sliderPaginationSelector
        ).appendChild(bullet)
      }

      this.rotateTestimonials = setInterval(() => {
        if (this.activeSlide == this.slideCount - 1) this.goTo(0);
        else this.goTo(this.activeSlide + 1);
      }, 4000);

      this.addEventListeners();
    }

    addEventListeners() {
      this.sliderEl.addEventListener('touchstart', this.onStart);
      this.sliderEl.addEventListener('mousedown', this.onStart);
      this.sliderEl.addEventListener('touchend', this.onEnd);
      this.sliderEl.addEventListener('mouseup', this.onEnd);

      Array.from(this.slideLinks).forEach(element => {
        element.addEventListener('click', e => {
          e.preventDefault();
        });
        element.addEventListener('mousedown', () => {
          this.swipeDetect = 0;
        });
        element.addEventListener('mousemove', () => {
          this.swipeDetect = 1;
        });
        element.addEventListener('mouseup', () => {
          if (this.swipeDetect === 0) {
            window.location = element.href;
          }
        });
      });
    }

    onStart(e) {
      this.touchstartX = e.pageX || e.changedTouches[0].screenX;
    }

    onEnd(e) {
      this.touchendX = e.pageX || e.changedTouches[0].screenX;
      if (this.touchstartX - this.touchendX > 25) {
        this.goTo(this.activeSlide + 1);
        clearInterval(this.rotateTestimonials);
      } else if (this.touchstartX - this.touchendX < -25){
        this.goTo(this.activeSlide - 1);
        clearInterval(this.rotateTestimonials);
      } else {
        this.goTo(this.activeSlide);
      } 
    }

    goTo(number) {
      this.isSlideAvailable(number);
      this.sliderEl.classList.add('is-animating');
      let percentage = -(100 / this.slideCount) * this.activeSlide;
      this.sliderEl.style.transform = 'translateX( ' + percentage + '% )';
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.sliderEl.classList.remove('is-animating');
      }, 400);
      this.upDatePagination();
    }

    goToSlide(number) {
      this.goTo(number);
      clearInterval(this.rotateTestimonials);
    }

    upDatePagination() {
      let pagination = this.sliderEl.parentElement.querySelectorAll(
        this.sliderPaginationSelector + ' > *'
      );
      for (let n = 0; n < pagination.length; n++) {
        let className = n == this.activeSlide ? 'active' : '';
        pagination[n].className = className;
        pagination[n].dataset.pos = n;
      }
    }

    isSlideAvailable(number) {
      if (number < 0) this.activeSlide = 0;
      else if (number > this.slideCount - 1)
        this.activeSlide = this.slideCount - 1;
      else this.activeSlide = number;
    }
  }

  window.addEventListener('load', () =>
    Array.from(document.querySelectorAll('.carousel__wrap')).forEach(
      el => new MobileSlider(el)
    )
  );
})();


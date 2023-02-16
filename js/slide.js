export class Slide {
  constructor(wrapper, slide) {
    this.wrapper = document.querySelector(wrapper);
    this.slide = document.querySelector(slide);
    this.dist = { startX: 0, moviment: 0, finalPosition: 0 };
    this.changeEvent = new Event('changeevent');
  }

  updatePosition(positionX) {
    this.dist.finalMoviment = positionX;
    this.slide.style.transform = `translate3d(${positionX}px,0,0)`;
  }

  onMove(event) {
    if (event.type === 'mousemove') this.dist.moviment = event.clientX - this.dist.startX
    else this.dist.moviment = event.changedTouches[0].screenX - this.dist.startX
    const positionX = this.dist.moviment + this.dist.finalPosition;
    this.updatePosition(positionX);
  }

  onStart(event) {
    event.preventDefault();
    if (event.type === 'mousedown') {
      this.wrapper.addEventListener('mousemove', this.onMove);
      this.dist.startX = event.clientX;
    } else {
      this.wrapper.addEventListener('touchmove', this.onMove);
      this.dist.startX = event.changedTouches[0].screenX;
    }
    this.transition(false);
  }

  onEnd(event) {
    this.dist.finalPosition = this.dist.finalMoviment;
    event.type === 'mouseup' ? this.wrapper.removeEventListener('mousemove', this.onMove) 
    : this.wrapper.removeEventListener('touchmove', this.onMove);
    this.changeSlideOnEnd();
    this.transition(true);
  }

  addSlideEvents() {
    this.wrapper.addEventListener('mousedown', this.onStart);
    this.wrapper.addEventListener('mouseup', this.onEnd);
    this.wrapper.addEventListener('touchstart', this.onStart);
    this.wrapper.addEventListener('touchend', this.onEnd);
  }

  slidePosition(element) {
    const margin = (this.wrapper.offsetWidth - element.offsetWidth) /2;
    return -(element.offsetLeft -margin);
  }

  slideConfig() {
    this.arraySlide = [...this.slide.children].map((element) => {
      const position = this.slidePosition(element);
      return { element, position };
    });
  }

  slideIndexNav(index) {
    const last = this.arraySlide.length -1;
    return {
      prev: index === 0 ? undefined : index -1,
      active: index,
      next: index === last ? undefined : index +1
    };
  }

  changeSlide(index) {
    this.index = this.slideIndexNav(index);
    this.dist.finalPosition = this.arraySlide[this.index.active].position;
    this.updatePosition(this.dist.finalPosition);
    this.changeActiveSlide();
    this.wrapper.dispatchEvent(this.changeEvent);
  }

  activePrevSlide() {
    if (this.index.prev !== undefined) this.changeSlide(this.index.prev);
  }

  activeSlide() {
    this.changeSlide(this.index.active);
  }

  activeNextSlide() {
    if (this.index.next !== undefined) this.changeSlide(this.index.next);
  }

  changeSlideOnEnd() {
    if (this.dist.moviment < -120 && this.index.next !== undefined) {
      this.activeNextSlide();
    } else if (this.dist.moviment > 120 && this.index.prev !== undefined) {
      this.activePrevSlide();
    } else {
      this.activeSlide();
    }
    this.dist.moviment = 0;
  }

  changeActiveSlide() {
    this.arraySlide.forEach(item => item.element.classList.remove('active'));
    this.arraySlide[this.index.active].element.classList.add('active');
  }

  transition(condition) {
    if (condition) {
      this.slide.style.transition= 'transform .3s';
    } else {
      this.slide.style.transition= 'transform 0s';
    }
  }
  
  onResize() {
    setTimeout(() => {
      this.slideConfig();
      this.activeSlide();
    }, 500)
  }

  addResizeEvent() {
    window.addEventListener('resize', this.onResize)
  }
  
  bindSlideEvents() {
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
    this.onResize = this.onResize.bind(this);
    this.activePrevSlide = this.activePrevSlide.bind(this);
    this.activeNextSlide = this.activeNextSlide.bind(this);
  }
  init() {
    this.bindSlideEvents();
    this.slideConfig();
    this.changeSlide(2);
    this.addSlideEvents();
    this.addResizeEvent();
  }
}

export default class SlideNav extends Slide {
  constructor(wrapper, slide) {
    super(wrapper, slide);
    this.bindControlEvents();
  }

  addArrow(prev, next) {
    this.prevElement = document.querySelector(prev);
    this.nextElement = document.querySelector(next);
    this.addArrowEvents();
  }

  addArrowEvents() {
    this.prevElement.addEventListener('click', this.activePrevSlide);
    this.nextElement.addEventListener('click', this.activeNextSlide);
  }

  activeControlItem() {
    this.control.forEach(item => item.classList.remove('active'));
    this.control[this.index.active].classList.add('active');
  }
  
  eventControl(item, index) {
    item.addEventListener('click', (event)=> {
      event.preventDefault();
      this.changeSlide(index);
    })
    this.wrapper.addEventListener('changeevent', this.activeControlItem);
  }

  addControl(customControl) {
    const control = document.querySelector(customControl) || this.createControl();
    this.control = [...control.children];
    this.control.forEach(this.eventControl)
    this.activeControlItem();
  }

  createControl() {
    const control = document.createElement('ul');
    control.dataset.control = 'slide';
    this.arraySlide.forEach((item, index) => {
      control.innerHTML += `<li><a href="slide${index +1}">${index +1}</a></li>`
    });
    this.wrapper.appendChild(control);
    return control;
  }

  bindControlEvents() {
    this.eventControl = this.eventControl.bind(this);
    this.activeControlItem = this.activeControlItem.bind(this);
  } 
}
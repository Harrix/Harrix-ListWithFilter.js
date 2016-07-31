function changeSizeFiguraInPhotoswipeGallery()
{
    //Функция подсчета ширины рисунков в галереях
    var width_content = $(".content-with-gallery").width();
    var w_figura = (width_content - 40)/3;
    $(".msnry_item").width(w_figura);
}

function forcedDisplaySidebar()
{
    //Функция принудительного показа боковой панели при увеличении размера окна
    var width_content = $("body").width();
    
    if (width_content > 992)
      $('.spoiler-text-sidebar').show();
}

$(document).ready(function() {    
  //Запускаем подсветку синтаксиса
  $('pre code').each(function(i, block) {
    hljs.highlightBlock(block);
  });

  //Меняем размеры элементов у галерей
  changeSizeFiguraInPhotoswipeGallery();
    
  //Находим все вставки LaTeX в виде div класса tex и рендерим их
  var tex = document.getElementsByClassName("tex");
  Array.prototype.forEach.call(tex, function(el) {
    katex.render(el.getAttribute("data-expr"), el,{ displayMode: true });
  });
  
  //Запускаем поиск галерей, чтобы привести сетку изображений к нужному виду
  $('.photoswipe_gallery').masonry({
    // options
    itemSelector: '.msnry_item',
    fitWidth: true,  
  });
  
  //События при изменении размера окна
  $(window).resize(function() {
    //При изменении размеров окна тоже нужно поменять размеры изображений в галереях 
    changeSizeFiguraInPhotoswipeGallery();
    
    //Принудительно показываем боковую панель при увеличении размера окна
    forcedDisplaySidebar()
  });
  
  //Работаем с заголовком при скролле страницы
  $(window).scroll(function(){
    var bo = $(this).scrollTop();
    if ( bo >= 50) {
      $("#logo").addClass("logo-small");
      $("#header-nav").addClass("header-nav-small");
      $("#header").addClass("header-small");
      $("#main-nav").addClass("main-nav-small");
      $("#navbar-toggler").addClass("navbar-toggler-small");
      $(".first-section").addClass("first-section-small");
    }
    else {
      $("#logo").removeClass("logo-small");
      $("#header-nav").removeClass("header-nav-small");
      $("#header").removeClass("header-small");
      $("#main-nav").removeClass("main-nav-small");
      $("#navbar-toggler").removeClass("navbar-toggler-small");
      $(".first-section").removeClass("first-section-small");
    }
  });
  
  //Скрываем или показываем кнопку "Наверх"
  $(window).scroll(function(){
    if ($(this).scrollTop() > 200) {

      $('#top-link').fadeIn();
    } else {
      $('#top-link').fadeOut();
    }
  });
  
  //При нажатии на кнопку "Наверх" анимируем переход
  $('#top-link').click(function(){
    $('html, body').animate({scrollTop : 0},800);
    return false;
  });
  
  //Подготавливаем сплойеры
  $('.spoiler-text').hide();
  $('.spoiler').click(function() {
    $(this).toggleClass("folded").toggleClass("unfolded").next().slideToggle();
  });
  
  //В мобильной версии список разделов прячем под сплойером. Тут его работа прописана
  $('.spoiler-sidebar').click(function() {
    $(this).toggleClass("folded").toggleClass("unfolded").next().slideToggle();
  });
  
  //Включаем авторазмер iframe, которые есть на странице
  iFrameResize({});
});

$(function() {
  $('a[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 800);
        return false;
      }
    }
  });
});
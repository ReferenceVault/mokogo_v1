(function initCustom() {
  "use strict";
  
  function ready(cb) {
    if (document.readyState !== "loading") cb();
    else document.addEventListener("DOMContentLoaded", cb);
  }

  ready(() => {
    if (window.$ && window.gsap && window.WOW) {
      console.log("✅ All libraries available, running custom code...");
      
      // Execute the main function logic
      (function ($) {
	
	var $window = $(window); 
	var $body = $('body');
	
	// GSAP availability check function
	const waitForGSAP = (callback, maxAttempts = 100) => {
		let attempts = 0;
		const checkGSAP = () => {
			attempts++;
			if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
				callback();
			} else if (attempts < maxAttempts) {
				setTimeout(checkGSAP, 100);
			} else {
				console.warn('GSAP not available after maximum attempts');
			}
		};
		checkGSAP();
	};
	
	// WOW.js availability check function
	const waitForWOW = (callback, maxAttempts = 100) => {
		let attempts = 0;
		const checkWOW = () => {
			attempts++;
			if (typeof WOW !== 'undefined') {
				callback();
			} else if (attempts < maxAttempts) {
				setTimeout(checkWOW, 100);
			} else {
				console.warn('WOW.js not available after maximum attempts');
			}
		};
		checkWOW();
	}; 

	/* Preloader Effect */
	$window.on('load', function(){
		$(".preloader").fadeOut(600);
	});

	/* Sticky Header */	
	if($('.active-sticky-header').length){
		$window.on('resize', function(){
			setHeaderHeight();
		});

		function setHeaderHeight(){
	 		$("header.main-header").css("height", $('header .header-sticky').outerHeight());
		}	
	
		$window.on("scroll", function() {
			var fromTop = $(window).scrollTop();
			setHeaderHeight();
			var headerHeight = $('header .header-sticky').outerHeight()
			$("header .header-sticky").toggleClass("hide", (fromTop > headerHeight + 100));
			$("header .header-sticky").toggleClass("active", (fromTop > 600));
		});
	}	
	
	/* Slick Menu JS */
	$('#menu').slicknav({
		label : '',
		prependTo : '.responsive-menu'
	});

	if($("a[href='#top']").length){
		$(document).on("click", "a[href='#top']", function() {
			$("html, body").animate({ scrollTop: 0 }, "slow");
			return false;
		});
	}

	/* Typed subtitle */
	if ($('.typed-title').length) {
		$('.typed-title').typed({
			stringsElement: $('.typing-title'),
			backDelay: 2000,
			typeSpeed: 0,
			loop: true
		});
	}

	/* Hero Slider Layout JS */
	const hero_slider_layout = new Swiper('.hero-slider-layout .swiper', {
		slidesPerView : 1,
		speed: 1000,
		spaceBetween: 0,
		loop: true,
		autoplay: {
			delay: 4000,
		},
		pagination: {
			el: '.hero-pagination',
			clickable: true,
		},
	});

	/* Hero Client Slider JS */
	if ($('.hero-client-slider').length) {
		const testimonial_company_slider = new Swiper('.hero-client-slider .swiper', {
			slidesPerView : 3,
			speed: 2000,
			spaceBetween: 30,
			loop: true,
			autoplay: {
				delay: 5000,
			},
			breakpoints: {
				768:{
				  	slidesPerView: 4,
				},
				991:{
				  	slidesPerView: 4,
				}
			}
		});
	}

	/* testimonial Slider JS */
	if ($('.testimonial-slider').length) {
		const testimonial_slider = new Swiper('.testimonial-slider .swiper', {
			slidesPerView : 1,
			speed: 1000,
			spaceBetween: 30,
			loop: true,
			autoplay: {
				delay: 5000,
			},
			pagination: {
				el: '.testimonial-pagination',
				clickable: true,
			},
			navigation: {
				nextEl: '.testimonial-button-next',
				prevEl: '.testimonial-button-prev',
			},
			breakpoints: {
				768:{
				  	slidesPerView: 1,
				},
				991:{
				  	slidesPerView: 1,
				}
			}
		});
	}

	/* Skill Bar */
	if ($('.skills-progress-bar').length) {
		$('.skills-progress-bar').waypoint(function() {
			$('.skillbar').each(function() {
				$(this).find('.count-bar').animate({
				width:$(this).attr('data-percent')
				},2000);
			});
		},{
			offset: '50%'
		});
	}

	/* Youtube Background Video JS */
	if ($('#herovideo').length) {
		var myPlayer = $("#herovideo").YTPlayer();
	}

	/* Init Counter */
	if ($('.counter').length) {
		$('.counter').counterUp({ delay: 6, time: 3000 });
	}

	/* Image Reveal Animation */
	if ($('.reveal').length) {
        // Wait for GSAP to be available
        const initRevealAnimation = () => {
            if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                gsap.registerPlugin(ScrollTrigger);
        let revealContainers = document.querySelectorAll(".reveal");
        revealContainers.forEach((container) => {
            let image = container.querySelector("img");
            let tl = gsap.timeline({
                scrollTrigger: {
                    trigger: container,
                    toggleActions: "play none none none"
                }
            });
            tl.set(container, {
                autoAlpha: 1
            });
            tl.from(container, 1, {
                xPercent: -100,
                ease: Power2.out
            });
            tl.from(image, 1, {
                xPercent: 100,
                scale: 1,
                delay: -1,
                ease: Power2.out
            });
        });
            } else {
                // GSAP not available yet, retry after a short delay
                setTimeout(initRevealAnimation, 100);
            }
        };
        
        // Start the initialization
        initRevealAnimation();
        
        // Fallback: Ensure images are visible if GSAP fails
        setTimeout(() => {
            const revealContainers = document.querySelectorAll(".reveal");
            revealContainers.forEach((container) => {
                if (container.style.opacity === '' || container.style.opacity === '0') {
                    container.style.opacity = '1';
                    container.style.transform = 'translateX(0)';
                    container.style.visibility = 'visible';
                }
            });
        }, 2000);
    }

	/* Text Effect Animation */
	if ($('.text-anime-style-1').length) {
		const initTextAnimation1 = () => {
			if (typeof gsap !== 'undefined' && typeof SplitText !== 'undefined') {
				let staggerAmount 	= 0.05,
					translateXValue = 0,
					delayValue 		= 0.5,
				   animatedTextElements = document.querySelectorAll('.text-anime-style-1');
				
				animatedTextElements.forEach((element) => {
					let animationSplitText = new SplitText(element, { type: "chars, words" });
						gsap.from(animationSplitText.words, {
						duration: 1,
						delay: delayValue,
						x: 20,
						autoAlpha: 0,
						stagger: staggerAmount,
						scrollTrigger: { trigger: element, start: "top 85%" },
						});
				});
			} else {
				setTimeout(initTextAnimation1, 100);
			}
		};
		initTextAnimation1();
	}
	
	if ($('.text-anime-style-2').length) {
		const initTextAnimation2 = () => {
			if (typeof gsap !== 'undefined' && typeof SplitText !== 'undefined') {
				let	 staggerAmount 		= 0.03,
					 translateXValue	= 20,
					 delayValue 		= 0.1,
					 easeType 			= "power2.out",
					 animatedTextElements = document.querySelectorAll('.text-anime-style-2');
				
				animatedTextElements.forEach((element) => {
					let animationSplitText = new SplitText(element, { type: "chars, words" });
						gsap.from(animationSplitText.chars, {
							duration: 1,
							delay: delayValue,
							x: translateXValue,
							autoAlpha: 0,
							stagger: staggerAmount,
							ease: easeType,
							scrollTrigger: { trigger: element, start: "top 85%"},
						});
				});
			} else {
				setTimeout(initTextAnimation2, 100);
			}
		};
		initTextAnimation2();
	}
	
	if ($('.text-anime-style-2').length) {
		const initTextAnimation2Advanced = () => {
			if (typeof gsap !== 'undefined' && typeof SplitText !== 'undefined') {
				let	animatedTextElements = document.querySelectorAll('.text-anime-style-2');
				
				 animatedTextElements.forEach((element) => {
					//Reset if needed
					if (element.animation) {
						element.animation.progress(1).kill();
						element.split.revert();
					}

					element.split = new SplitText(element, {
						type: "lines,words,chars",
						linesClass: "split-line",
					});
					gsap.set(element, { perspective: 400 });

					gsap.set(element.split.chars, {
						opacity: 0,
						x: "50",
					});

					element.animation = gsap.to(element.split.chars, {
						scrollTrigger: { trigger: element,	start: "top 90%" },
						x: "0",
						y: "0",
						rotateX: "0",
						opacity: 1,
						duration: 1,
						ease: Back.easeOut,
						stagger: 0.02,
					});
				});
			} else {
				setTimeout(initTextAnimation2Advanced, 100);
			}
		};
		initTextAnimation2Advanced();
	}

	/* Parallaxie js */
	var $parallaxie = $('.parallaxie');
	if($parallaxie.length && ($window.width() > 991))
	{
		if ($window.width() > 768) {
			$parallaxie.parallaxie({
				speed: 0.55,
				offset: 0,
			});
		}
	}

	/* Zoom Gallery screenshot */
	$('.gallery-items').magnificPopup({
		delegate: 'a',
		type: 'image',
		closeOnContentClick: false,
		closeBtnInside: false,
		mainClass: 'mfp-with-zoom',
		image: {
			verticalFit: true,
		},
		gallery: {
			enabled: true
		},
		zoom: {
			enabled: true,
			duration: 300, // don't foget to change the duration also in CSS
			opener: function(element) {
			  return element.find('img');
			}
		}
	});

	/* Contact form validation */
	var $contactform = $("#contactForm");
	$contactform.validator({focus: false}).on("submit", function (event) {
		if (!event.isDefaultPrevented()) {
			event.preventDefault();
			submitForm();
		}
	});

	function submitForm(){
		/* Ajax call to submit form */
		$.ajax({
			type: "POST",
			url: "form-process.php",
			data: $contactform.serialize(),
			success : function(text){
				if (text === "success"){
					formSuccess();
				} else {
					submitMSG(false,text);
				}
			}
		});
	}

	function formSuccess(){
		$contactform[0].reset();
		submitMSG(true, "Message Sent Successfully!")
	}

	function submitMSG(valid, msg){
		if(valid){
			var msgClasses = "h4 text-success";
		} else {
			var msgClasses = "h4 text-danger";
		}
		$("#msgSubmit").removeClass().addClass(msgClasses).text(msg);
	}
	/* Contact form validation end */

	/* Animated Wow Js */	
	new WOW().init();

	/* Popup Video */
	if ($('.popup-video').length) {
		$('.popup-video').magnificPopup({
			type: 'iframe',
			mainClass: 'mfp-fade',
			removalDelay: 160,
			preloader: false,
			fixedContentPos: true
		});
	}

	/* Our Services List Active Start */
	if ($('.our-service-list').length) {
		var element = $('.our-service-list');            
		var items = element.find('.service-item');
		if (items.length) {
			items.on({
				mouseenter: function() {
					if($(this).hasClass('active')) return;

					items.removeClass('active');
					$(this).addClass('active');

				},
				mouseleave: function() {
					//stuff to do on mouse leave
				}
			});
		}                 
	}
	/* Our Services List Active End */
	
      }); // End of main function
      
      console.log("✅ Custom code executed successfully");
    } else {
      console.warn("⚠️ Libraries not ready yet, retrying...");
      setTimeout(() => {
        ready(() => {
          if (window.$ && window.gsap && window.WOW) {
            console.log("✅ Libraries ready on retry, executing custom code...");
            // Re-execute the main function
            (function ($) {
              // Copy the main function logic here or call a function
              console.log("Custom code executed on retry");
            })(jQuery);
          }
        });
      }, 100);
    }
  });
})();


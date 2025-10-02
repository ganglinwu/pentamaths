// app/page.tsx
"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";

export default function HomePage() {
  useEffect(() => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const href = (e.currentTarget as HTMLAnchorElement).getAttribute(
          "href",
        );
        if (href) {
          const target = document.querySelector(href);
          target?.scrollIntoView({
            behavior: "smooth",
          });
        }
      });
    });

    // Navbar background on scroll
    const handleScroll = () => {
      const nav = document.querySelector("nav");
      if (nav) {
        if (window.scrollY > 100) {
          nav.style.background = "rgba(255, 255, 255, 0.98)";
        } else {
          nav.style.background = "rgba(255, 255, 255, 0.95)";
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Add intersection observer for animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          target.style.opacity = "1";
          target.style.transform = "translateY(0)";
        }
      });
    }, observerOptions);

    // Observe all service cards and testimonial cards
    document
      .querySelectorAll(".service-card, .testimonial-card, .stat-item")
      .forEach((el) => {
        const element = el as HTMLElement;
        element.style.opacity = "0";
        element.style.transform = "translateY(20px)";
        element.style.transition = "all 0.6s ease";
        observer.observe(element);
      });

    // Form submission
    const form = document.querySelector(
      ".contact-form form",
    ) as HTMLFormElement;
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        alert("Thank you for your message! We'll get back to you soon.");
        this.reset();
      });
    }

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const [hasVideo, setHasVideo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [modalReview, setModalReview] = useState<{
    title: string;
    content: string;
    reviewer: string;
  } | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentTestimonialSlideIndex, setCurrentTestimonialSlideIndex] =
    useState(0);
  const [serviceDetailsVisible, setServiceDetailsVisible] = useState({
    "a-math": false,
    "h2-math": false,
    "teaching-options": false,
  });
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [showVirtualSeat, setShowVirtualSeat] = useState(false);

  // Form state for spam protection
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subjectLevel: "",
    message: "",
    website: "", // This looks like a legitimate field but it's our spam trap!
    phoneNumber: "", // Another decoy field
    companyName: "", // Yet another decoy field
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number>(0);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  // Initialize reCAPTCHA Enterprise
  useEffect(() => {
    const checkRecaptcha = () => {
      if (typeof window !== "undefined" && (window as any).grecaptcha) {
        setRecaptchaLoaded(true);
      } else {
        setTimeout(checkRecaptcha, 100);
      }
    };
    checkRecaptcha();
  }, []);

  useEffect(() => {
    // Set up video for all devices
    // if (!isMobile) {
    const video = document.querySelector(".hero-video") as HTMLVideoElement;
    const heroSection = document.querySelector(".hero");

    if (video && heroSection) {
      const handleVideoLoad = () => {
        setHasVideo(true);
        heroSection.classList.add("has-video");
        // Ensure video plays
        video.play().catch(() => {
          console.log("Video autoplay failed");
        });
      };

      const handleVideoError = () => {
        setHasVideo(false);
        heroSection.classList.remove("has-video");
      };

      // Check if video is already loaded
      if (video.readyState >= 2) {
        handleVideoLoad();
      } else {
        video.addEventListener("loadeddata", handleVideoLoad);
      }

      video.addEventListener("error", handleVideoError);

      return () => {
        video.removeEventListener("loadeddata", handleVideoLoad);
        video.removeEventListener("error", handleVideoError);
      };
    }
    // }
  }, [isMobile]);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const mobile =
        window.innerWidth <= 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        );
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Carousel functionality
  const totalSlides = 5;

  const currentSlide = (n: number) => {
    setCurrentSlideIndex(n - 1);
  };

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000); // Auto-scroll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Time slot selection functionality
  const handleTimeSlotClick = (timeSlot: string) => {
    setSelectedTimeSlots((prev) => {
      if (prev.includes(timeSlot)) {
        // Remove if already selected
        return prev.filter((slot) => slot !== timeSlot);
      } else {
        // Determine which cohort this slot belongs to
        const isJC2025 = timeSlot.includes("JC1 2025");
        const isJC2026 = timeSlot.includes("JC1 2026");

        // Filter out slots from the other cohort when selecting a new one
        const filteredPrev = prev.filter((slot) => {
          if (isJC2025) return slot.includes("JC1 2025");
          if (isJC2026) return slot.includes("JC1 2026");
          return true;
        });

        // Add the new slot
        return [...filteredPrev, timeSlot];
      }
    });
  };

  // Generate WhatsApp message with selected time slots
  const generateWhatsAppMessage = () => {
    const baseMessage =
      "Hi! I'm interested in group discounts for H2 Math tuition. Can you tell me more about the savings when attending with friends?";

    if (selectedTimeSlots.length > 0) {
      const selectedSlots = selectedTimeSlots.join(", ");
      return `${baseMessage} We're interested in these time slots: ${selectedSlots}`;
    }

    return baseMessage;
  };

  // Generate H2 Math schedule inquiry message with selected time slots
  const generateH2MathScheduleMessage = () => {
    const baseMessage =
      "Hi! I'm interested in H2 Math tuition but need information about different time slots or availability. Could you help me find a suitable schedule?";

    if (selectedTimeSlots.length > 0) {
      const selectedSlots = selectedTimeSlots.join(", ");
      const cohort = selectedTimeSlots[0].includes("JC1 2025")
        ? "JC1 2025"
        : "JC1 2026";
      return `${baseMessage} I'm interested in the ${cohort} cohort but the current times (${selectedSlots}) don't work for me. Do you have alternative timings or future batches available?`;
    }

    return baseMessage;
  };

  useEffect(() => {
    // Update slide visibility and dots with sliding animation for testimonials-revamped ONLY
    const slides = document.querySelectorAll(
      ".testimonials-revamped .testimonial-slide",
    );
    const dots = document.querySelectorAll(".testimonials-revamped .dot");

    slides.forEach((slide, index) => {
      slide.classList.remove("active", "prev");

      if (index === currentSlideIndex) {
        slide.classList.add("active");
      } else if (index < currentSlideIndex) {
        slide.classList.add("prev");
      }
    });

    dots.forEach((dot, index) => {
      if (index === currentSlideIndex) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  }, [currentSlideIndex]);

  // Video carousel functionality
  const totalVideos = 3;

  const getMaxVideoIndex = () => {
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
    return isMobile ? totalVideos - 1 : 1; // Mobile: show 1 video (max index 2), Desktop: show 2 videos (max index 1)
  };

  const nextVideo = () => {
    const maxIndex = getMaxVideoIndex();
    setCurrentVideoIndex((prev) => (prev + 1) % (maxIndex + 1));
  };

  const prevVideo = () => {
    const maxIndex = getMaxVideoIndex();
    setCurrentVideoIndex(
      (prev) => (prev - 1 + (maxIndex + 1)) % (maxIndex + 1),
    );
  };

  const goToVideo = (index: number) => {
    setCurrentVideoIndex(index);
  };

  useEffect(() => {
    // Update video carousel position
    const videoTrack = document.getElementById("videoTrack");
    const indicators = document.querySelectorAll(".video-indicator");

    if (videoTrack) {
      // Check if mobile (window width <= 768px)
      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        // On mobile, each video takes 100% width, so move by 100% per step
        const translateX = -currentVideoIndex * 100;
        videoTrack.style.transform = `translateX(${translateX}%)`;
      } else {
        // On desktop, show 2 videos at a time, move by 50% per step
        const translateX = -currentVideoIndex * 50;
        videoTrack.style.transform = `translateX(${translateX}%)`;
      }
    }

    indicators.forEach((indicator, index) => {
      indicator.classList.toggle("active", index === currentVideoIndex);
    });
  }, [currentVideoIndex]);

  useEffect(() => {
    // Set up video carousel event listeners
    const videoPrev = document.getElementById("videoPrev");
    const videoNext = document.getElementById("videoNext");
    const videoIndicators = document.querySelectorAll(".video-indicator");

    const handlePrevClick = () => prevVideo();
    const handleNextClick = () => nextVideo();

    videoPrev?.addEventListener("click", handlePrevClick);
    videoNext?.addEventListener("click", handleNextClick);

    videoIndicators.forEach((indicator, index) => {
      const handleIndicatorClick = () => goToVideo(index);
      indicator.addEventListener("click", handleIndicatorClick);
    });

    return () => {
      videoPrev?.removeEventListener("click", handlePrevClick);
      videoNext?.removeEventListener("click", handleNextClick);
      videoIndicators.forEach((indicator, index) => {
        const handleIndicatorClick = () => goToVideo(index);
        indicator.removeEventListener("click", handleIndicatorClick);
      });
    };
  }, []);

  // Auto-scroll for testimonials section
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialSlideIndex((prev) => {
        const nextIndex = (prev + 1) % totalTestimonialSlides;
        return nextIndex;
      });
    }, 7000); // Auto-scroll every 7 seconds
    return () => clearInterval(interval);
  }, []);

  // Testimonials section state effect
  useEffect(() => {
    updateTestimonialSlides(currentTestimonialSlideIndex);
  }, [currentTestimonialSlideIndex]);

  useEffect(() => {
    // Mobile services section collapse functionality
    const handleServicesHeaderClick = () => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        const servicesSection = document.querySelector(".services");
        if (servicesSection) {
          servicesSection.classList.toggle("expanded");
          servicesSection.classList.toggle("collapsed");
        }
      }
    };

    const servicesHeader = document.querySelector(".services .section-header");
    if (servicesHeader) {
      servicesHeader.addEventListener("click", handleServicesHeaderClick);
    }

    // Initialize as collapsed on mobile
    const checkAndInitialize = () => {
      const isMobile = window.innerWidth <= 768;
      const servicesSection = document.querySelector(".services");
      if (isMobile && servicesSection) {
        servicesSection.classList.add("collapsed");
      } else if (servicesSection) {
        servicesSection.classList.add("expanded");
      }
    };

    checkAndInitialize();
    window.addEventListener("resize", checkAndInitialize);

    return () => {
      if (servicesHeader) {
        servicesHeader.removeEventListener("click", handleServicesHeaderClick);
      }
      window.removeEventListener("resize", checkAndInitialize);
    };
  }, []);

  const toggleServiceDetails = (serviceType: string) => {
    setServiceDetailsVisible((prev) => ({
      ...prev,
      [serviceType]: !prev[serviceType as keyof typeof prev],
    }));
  };

  // Testimonials section carousel functionality
  const totalTestimonialSlides = 7;

  const currentTestimonialSlide = (n: number) => {
    const index = n - 1;
    setCurrentTestimonialSlideIndex(index);
    updateTestimonialSlides(index);
  };

  const updateTestimonialSlides = (activeIndex: number) => {
    const slides = document.querySelectorAll(
      "#testimonials .testimonial-slide",
    );
    const dots = document.querySelectorAll("#testimonials .dot");

    slides.forEach((slide, slideIndex) => {
      slide.classList.remove("active", "prev");
      if (slideIndex === activeIndex) {
        slide.classList.add("active");
      } else if (slideIndex < activeIndex) {
        slide.classList.add("prev");
      }
    });

    dots.forEach((dot, dotIndex) => {
      if (dotIndex === activeIndex) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  };

  const nextTestimonialSlide = () => {
    const nextIndex =
      (currentTestimonialSlideIndex + 1) % totalTestimonialSlides;
    setCurrentTestimonialSlideIndex(nextIndex);
    updateTestimonialSlides(nextIndex);
  };

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check for disposable email domains (basic list)
  const isDisposableEmail = (email: string) => {
    const disposableDomains = [
      "10minutemail.com",
      "guerrillamail.com",
      "mailinator.com",
      "tempmail.org",
      "yopmail.com",
      "throwaway.email",
    ];
    const domain = email.split("@")[1]?.toLowerCase();
    return disposableDomains.includes(domain);
  };

  // Handle form submission with spam protection
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Spam Protection Check #1: Rate limiting (minimum 30 seconds between submissions)
    const currentTime = Date.now();
    const timeSinceLastSubmission = currentTime - lastSubmissionTime;
    const minimumDelay = 30 * 1000; // 30 seconds

    if (lastSubmissionTime > 0 && timeSinceLastSubmission < minimumDelay) {
      const remainingTime = Math.ceil(
        (minimumDelay - timeSinceLastSubmission) / 1000,
      );
      alert(
        `Please wait ${remainingTime} more seconds before submitting again.`,
      );
      return;
    }

    // Spam Protection Check #2: Advanced Honeypots (Silent Detection)
    let isSpam = false;
    let spamReason = "";

    // Check for filled decoy fields
    if (formData.website || formData.phoneNumber || formData.companyName) {
      isSpam = true;
      spamReason = "Decoy fields filled";
    }

    // Check for invalid education levels (contextual honeypot)
    const validLevels = ["h2-maths", "h1-maths", "a-maths"];
    if (formData.subjectLevel && !validLevels.includes(formData.subjectLevel)) {
      isSpam = true;
      spamReason = "Invalid education level selected";
    }

    // Spam Protection Check #3: Email validation
    if (!isValidEmail(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (isDisposableEmail(formData.email)) {
      alert("Please use a permanent email address.");
      return;
    }

    // Spam Protection Check #4: Required fields
    if (!formData.fullName || !formData.email || !formData.message) {
      alert("Please fill in all required fields.");
      return;
    }

    // Update last submission time
    setLastSubmissionTime(currentTime);

    setFormSubmitting(true);

    try {
      // Spam Protection Check #5: reCAPTCHA Enterprise (Google's recommended approach)
      let recaptchaToken = null;
      if (typeof window !== "undefined" && (window as any).grecaptcha) {
        try {
          recaptchaToken = await new Promise<string>((resolve, reject) => {
            (window as any).grecaptcha.enterprise.ready(async () => {
              try {
                const token = await (
                  window as any
                ).grecaptcha.enterprise.execute(
                  "6Ldq8NArAAAAADRscCMvQQuQN_uSSrPsHy1UEWy5",
                  {
                    action: "contact_form",
                  },
                );
                resolve(token);
              } catch (error) {
                reject(error);
              }
            });
          });
          setCaptchaToken(recaptchaToken);
        } catch (error) {
          console.error("reCAPTCHA failed:", error);
          alert("Security verification failed. Please try again.");
          return;
        }
      }

      if (isSpam) {
        // Silent spam handling - log for analysis but show success to user
        console.log(`Spam submission blocked: ${spamReason}`, {
          timestamp: new Date().toISOString(),
          formData: formData,
          userAgent: navigator.userAgent,
          ip: "Client-side detection", // You'd get real IP on server-side
        });

        // Simulate processing time to avoid suspicion
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Show success message to bot/spammer (but don't actually process)
        alert("Thank you for your message! We'll get back to you soon.");
      } else {
        // Legitimate submission - send to backend
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            subjectLevel: formData.subjectLevel,
            message: formData.message,
            captchaToken: recaptchaToken,
            // Include honeypot fields for backend verification
            website: formData.website,
            phoneNumber: formData.phoneNumber,
            companyName: formData.companyName,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        // Track successful conversion only after legitimate form submission
        if (
          typeof window !== "undefined" &&
          (window as any).gtag_report_conversion
        ) {
          (window as any).gtag_report_conversion();
        }

        alert("Thank you for your message! We'll get back to you soon.");
      }

      // Reset form regardless (maintains consistent behavior)
      setFormData({
        fullName: "",
        email: "",
        subjectLevel: "",
        message: "",
        website: "",
        phoneNumber: "",
        companyName: "",
      });

      // Reset reCAPTCHA
      setCaptchaToken(null);
    } catch (error) {
      alert("There was an error sending your message. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div>
      <style>{`
        :root {
          /* Pentagon Learning Brand Colors from Logo */
          --brand-yellow: #F5C842;
          --brand-light-blue: #4FC3D7;
          --brand-dark-blue: #2E5984;
          --brand-gray: #6B7A8A;
          
          /* Neutral Colors */
          --dark-gray: #1F2937;
          --medium-gray: #6B7280;
          --light-gray: #F3F4F6;
          --white: #FFFFFF;
          
          /* Pentagon Brand Gradients */
          --gradient-primary: linear-gradient(135deg, var(--brand-light-blue) 0%, var(--brand-dark-blue) 100%);
          --gradient-secondary: linear-gradient(135deg, var(--brand-light-blue) 0%, var(--brand-gray) 100%);
          --gradient-accent: linear-gradient(135deg, var(--brand-yellow) 0%, var(--brand-gray) 100%);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: var(--dark-gray);
            overflow-x: hidden;
            max-width: 100vw;
        }

        * {
            box-sizing: border-box;
        }

        /* Smooth scrolling */
        html {
            scroll-behavior: smooth;
        }

        /* Navigation */
        nav {
            position: fixed;
            top: 0;
            width: 100%;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            z-index: 1000;
            padding: 1rem 0;
            transition: all 0.3s ease;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 2rem;
        }

        .logo {
            font-size: 1.8rem;
            font-weight: 800;
            background: var(--gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .nav-links {
            display: flex;
            list-style: none;
            gap: 2rem;
        }

        .nav-links a {
            text-decoration: none;
            color: var(--dark-gray);
            font-weight: 500;
            transition: color 0.3s ease;
            position: relative;
        }

        .nav-links a::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 0;
            height: 2px;
            background: var(--gradient-primary);
            transition: width 0.3s ease;
        }

        .nav-links a:hover {
            color: var(--brand-yellow);
        }

        .nav-links a:hover::after {
            width: 100%;
        }

        .cta-button {
            background: var(--gradient-primary);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(245, 200, 66, 0.3);
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(245, 200, 66, 0.4);
        }

        .cta-mobile {
            display: none;
        }

        /* Hero Section */
/* Video Background */
.hero-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center bottom;
    z-index: 1;
}

.hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    z-index: 2;
}

/* Hide floating cards when video is playing */
.hero.has-video .floating-cards {
    display: none;
}

/* Show alternative content when video is active */
.hero.has-video .hero-visual {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    text-align: center;
    color: white;
}

.video-overlay-content {
    display: none;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 2rem;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.hero.has-video .video-overlay-content {
    display: block;
}

.video-overlay-content h3,
.video-overlay-content p,
.video-overlay-content span {
    color: white !important;
}
        .hero {
            width: 100%;
            aspect-ratio: 16/6.75;
            display: flex;
            align-items: center;
            background: linear-gradient(135deg, #f8fafc 0%, #e1f5fe 50%, #fff9c4 100%);
            position: relative;
            overflow: hidden;
            padding-top: 0;
        }

        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="%234FC3D7" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.3;
        }

        .hero-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
            position: relative;
            z-index: 3;
            height: 100%;
        }

        .hero-content {
            animation: slideInLeft 1s ease-out;
            align-self: center;
            padding-top: 0;
        }

        .hero h1 {
            font-size: 3.5rem;
            font-weight: 800;
            margin-bottom: 1.5rem;
            line-height: 1.1;
            color: white;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }

        .hero p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            line-height: 1.6;
            color: var(--dark-gray);
        }

        .hero-buttons {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            margin-top: 2rem;
        }

        .btn-primary {
            background: var(--gradient-primary);
            color: white;
            padding: 1rem 2rem;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 8px 30px rgba(245, 200, 66, 0.6);
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 40px rgba(245, 200, 66, 0.7);
        }

        .btn-secondary {
            background: transparent;
            color: var(--brand-dark-blue);
            padding: 1rem 2rem;
            border: 2px solid var(--brand-dark-blue);
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .btn-secondary:hover {
            background: var(--brand-dark-blue);
            color: white;
            transform: translateY(-2px);
        }

        .hero-visual {
            display: flex;
            justify-content: center;
            align-items: center;
            animation: slideInRight 1s ease-out;
            padding-top: 0;
        }

        .floating-cards {
            position: relative;
            width: 400px;
            height: 400px;
        }

        .floating-card {
            position: absolute;
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            padding: 1.5rem;
            animation: float 6s ease-in-out infinite;
        }

        .floating-card:nth-child(1) {
            top: 0;
            left: 0;
            width: 200px;
            background: var(--gradient-primary);
            color: white;
        }

        .floating-card:nth-child(2) {
            top: 150px;
            right: 0;
            width: 180px;
            animation-delay: -2s;
            border: 2px solid var(--brand-light-blue);
        }

        .floating-card:nth-child(3) {
            bottom: 0;
            left: 50px;
            width: 160px;
            animation-delay: -4s;
            border: 2px solid var(--brand-gray);
        }

        .purple-floating-card-text {
            color: white;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }

        /* Revamped Testimonials Section */
        .testimonials-revamped {
            background: var(--light-gray);
            padding: 6rem 0;
        }

        .testimonials-revamped-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .testimonials-content {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 4rem;
            align-items: center;
            margin-top: 3rem;
        }

        .teacher-photo {
            text-align: center;
            display: flex;
            justify-content: center;
        }

        .teacher-photo-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }

        .teacher-photo img {
            width: 250px;
            height: 250px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid var(--brand-yellow);
            margin-bottom: 1.5rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .teacher-info h3 {
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--dark-gray);
            margin-bottom: 0.5rem;
        }

        .teacher-info p {
            color: var(--medium-gray);
            margin-bottom: 0.25rem;
        }

        .testimonials-carousel {
            position: relative;
        }

        .carousel-container {
            position: relative;
            overflow: hidden;
            border-radius: 20px;
            background: white;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            height: 300px;
        }

        .testimonial-slide {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            padding: 2.5rem;
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.5s ease-in-out;
        }

        .testimonial-slide:first-child {
            opacity: 1;
            transform: translateX(0);
        }

        .testimonial-slide.active {
            opacity: 1;
            transform: translateX(0);
        }

        .testimonial-slide.prev {
            transform: translateX(-100%);
        }

        .testimonial-slide .review-stars {
            color: var(--brand-yellow);
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
        }

        .testimonial-slide p {
            font-style: italic;
            color: var(--dark-gray);
            margin-bottom: 1.5rem;
            line-height: 1.6;
            font-size: 1.1rem;
        }

        .testimonial-slide .reviewer {
            font-weight: 600;
            color: var(--brand-dark-blue);
            margin-bottom: 1rem;
        }

        .testimonial-content {
            flex-grow: 1;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            flex-direction: column;
        }

        .carousel-dots {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            margin-top: 1.5rem;
        }

        .dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: var(--medium-gray);
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .dot.active {
            background: var(--brand-yellow);
            transform: scale(1.2);
        }

        .dot:hover {
            background: var(--brand-light-blue);
        }

        .read-more-link {
            color: var(--brand-dark-blue);
            cursor: pointer;
            text-decoration: underline;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .read-more-link:hover {
            color: var(--brand-yellow);
            text-decoration: none;
        }

        /* Modal */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(5px);
        }

        .modal-content {
            background: white;
            border-radius: 20px;
            padding: 2rem;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            margin: 1rem;
            position: relative;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .modal-close {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: var(--light-gray);
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            font-size: 1.2rem;
            color: var(--dark-gray);
            transition: all 0.3s ease;
        }

        .modal-close:hover {
            background: var(--brand-yellow);
        }

        .modal-stars {
            color: var(--brand-yellow);
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }

        .modal-text {
            color: var(--dark-gray);
            line-height: 1.6;
            margin-bottom: 1.5rem;
        }

        .modal-reviewer {
            font-weight: 600;
            color: var(--brand-dark-blue);
            text-align: right;
        }

        /* Stats Section */
        .stats {
            background: white;
            padding: 5rem 0;
        }

        .stats-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 3rem;
            text-align: center;
        }

        .stat-item {
            transition: transform 0.3s ease;
        }

        .stat-item:hover {
            transform: translateY(-10px);
        }

        .stat-number {
            font-size: 3rem;
            font-weight: 800;
            background: var(--gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            display: block;
        }

        .stat-label {
            font-size: 1.1rem;
            color: var(--medium-gray);
            margin-top: 0.5rem;
        }

        /* Services Section */
        .services {
            background: var(--light-gray);
            padding: 6rem 0;
        }

        .services-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .section-header {
            text-align: center;
            margin-bottom: 4rem;
        }

        .section-header h2 {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 1rem;
            color: var(--dark-gray);
        }

        .section-header p {
            font-size: 1.2rem;
            color: var(--medium-gray);
            max-width: 600px;
            margin: 0 auto;
        }

        .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }

        .service-card {
            background: white;
            border-radius: 20px;
            padding: 2.5rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
            border: 1px solid rgba(245, 200, 66, 0.1);
        }

        .service-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            border-color: var(--brand-yellow);
        }

        .service-card:nth-child(1) .service-icon {
            background: var(--gradient-primary);
        }

        .service-card:nth-child(2) .service-icon {
            background: var(--gradient-secondary);
        }

        .service-card:nth-child(3) .service-icon {
            background: var(--gradient-accent);
        }

        .service-card:nth-child(4) .service-icon {
            background: var(--gradient-primary);
        }

        .service-card:nth-child(5) .service-icon {
            background: var(--gradient-secondary);
        }

        .service-card:nth-child(6) .service-icon {
            background: var(--gradient-accent);
        }

        .service-icon {
            width: 60px;
            height: 60px;
            background: var(--gradient-primary);
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: white;
            margin-bottom: 1.5rem;
        }

        .service-card h3 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--dark-gray);
        }

        .service-card p {
            color: var(--medium-gray);
            line-height: 1.6;
            margin-bottom: 1.5rem;
        }

        .service-features {
            list-style: none;
        }

        .service-features li {
            color: var(--medium-gray);
            margin-bottom: 0.5rem;
            position: relative;
            padding-left: 1.5rem;
        }

        .service-features li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: var(--brand-light-blue);
            font-weight: bold;
        }

        /* Testimonials */
.testimonials {
    background: white;
    padding: 6rem 0;
    position: relative;
    overflow: hidden;
}

.testimonials-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    position: relative;
    z-index: 2;
}

        .testimonials-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
            margin-top: 4rem;
        }

        .testimonial-card {
            background: var(--light-gray);
            border-radius: 20px;
            padding: 2rem;
            position: relative;
            display: flex;
            flex-direction: column;
            border-left: 4px solid var(--brand-yellow);
        }

        .testimonial-card::before {
            content: '"';
            position: absolute;
            top: -10px;
            left: 20px;
            font-size: 4rem;
            color: var(--brand-light-blue);
            opacity: 0.3;
        }

        .testimonial-text {
            color: var(--dark-gray);
            margin-bottom: auto;
            line-height: 1.6;
            padding-bottom: 1.5rem;
        }

.testimonial-author {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
}

.author-avatar {
    position: relative;
    width: 80px;
    height: 80px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--brand-light-blue);
    overflow: visible;
}

.school-logo {
    width: 60px;
    height: 60px;
    object-fit: cover;
}

.student-initial {
    position: absolute;
    bottom: -5px;
    right: -5px;
    width: 24px;
    height: 24px;
    background: var(--gradient-primary);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    border: 2px solid white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.author-info h4 {
    font-weight: 600;
    color: var(--dark-gray);
    margin-bottom: 0.25rem;
}

.author-info p {
    color: var(--medium-gray);
    font-size: 0.9rem;
}

        /* Schedule Section */
        .schedule {
            background: white;
            padding: 6rem 0;
        }

        .schedule-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .schedule-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 3rem;
            margin-bottom: 3rem;
        }

        .schedule-card {
            background: white;
            border-radius: 20px;
            padding: 2.5rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(245, 200, 66, 0.1);
        }

        .schedule-card h3 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            color: var(--dark-gray);
        }

        .time-slots {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .day-slot h4 {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 0.8rem;
            color: var(--primary-color);
        }

        .time-options {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .time-slot {
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 500;
            border: 1px solid #e0e0e0;
            background: #f8f9fa;
        }

        .time-slot.available {
            background: #e8f5e8;
            border-color: #4caf50;
            color: #2e7d32;
        }

        .time-slot.limited {
            background: #fff3e0;
            border-color: #ff9800;
            color: #f57c00;
        }

        .time-slot.h2-math {
            background: #e3f2fd;
            border-color: #2196f3;
            color: #1565c0;
        }

        .time-slot.catchup {
            background: #fce4ec;
            border-color: #e91e63;
            color: #ad1457;
        }

        .time-slot {
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .time-slot:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .time-slot.selected {
            background: #4caf50 !important;
            border-color: #388e3c !important;
            color: white !important;
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
            transform: translateY(-2px);
        }

        .class-options {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .option-item {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
        }

        .option-icon {
            font-size: 1.5rem;
            margin-top: 0.2rem;
        }

        .option-content h4 {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: var(--dark-gray);
        }

        .option-content p {
            color: var(--medium-gray);
            font-size: 0.95rem;
        }

        .schedule-notes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }

        .schedule-note-card {
            background: white;
            padding: 2rem;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(245, 200, 66, 0.1);
            transition: all 0.3s ease;
            text-decoration: none;
            color: inherit;
            display: block;
        }

        .schedule-note-card.clickable-card {
            cursor: pointer;
        }

        .schedule-note-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
            text-decoration: none;
        }

        .note-icon {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }

        .schedule-note-card h4 {
            font-size: 1.3rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--dark-gray);
        }

        .schedule-note-card p {
            color: var(--medium-gray);
            margin-bottom: 1.5rem;
            font-size: 0.95rem;
        }

        .note-cta-text {
            display: inline-block;
            background: var(--primary-color);
            color: white;
            padding: 0.8rem 1.5rem;
            border-radius: 25px;
            font-weight: 600;
            font-size: 0.9rem;
            margin-top: 1rem;
            transition: all 0.3s ease;
        }

        .clickable-card:hover .note-cta-text {
            background: #e6b800;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(245, 200, 66, 0.3);
        }

        .class-description {
            font-size: 0.85rem;
            color: var(--medium-gray);
            margin-top: 0.8rem;
            font-style: italic;
        }

        .h2-color {
            color: #1565c0;
            font-weight: 600;
        }

        .catchup-color {
            color: #ad1457;
            font-weight: 600;
        }

        .whatsapp-link {
            color: #25d366;
            text-decoration: none;
            font-weight: 600;
            margin-left: 0.5rem;
            transition: all 0.3s ease;
        }

        .whatsapp-link:hover {
            color: #128c7e;
            text-decoration: underline;
        }

        /* Pricing Section */
        .pricing {
            background: var(--light-gray);
            padding: 6rem 0;
        }

        .pricing-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .pricing-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }

        .pricing-card {
            background: white;
            border-radius: 20px;
            padding: 2.5rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(245, 200, 66, 0.1);
            position: relative;
            transition: all 0.3s ease;
        }

        .pricing-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .pricing-card.featured {
            border: 2px solid var(--primary-color);
            transform: scale(1.05);
        }

        .pricing-badge {
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--primary-color);
            color: white;
            padding: 0.5rem 1.5rem;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
        }

        .pricing-header {
            text-align: center;
            margin-bottom: 2rem;
        }

        .pricing-header h3 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--dark-gray);
        }

        .price {
            display: flex;
            align-items: baseline;
            justify-content: center;
            gap: 0.2rem;
        }

        .currency {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--primary-color);
        }

        .amount {
            font-size: 3rem;
            font-weight: 800;
            color: var(--primary-color);
        }

        .period {
            font-size: 1rem;
            color: var(--medium-gray);
        }

        .pricing-features {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .pricing-features li {
            padding: 0.8rem 0;
            border-bottom: 1px solid #f0f0f0;
            color: var(--dark-gray);
        }

        .pricing-features li:last-child {
            border-bottom: none;
        }


        .pricing-cta {
            text-align: center;
        }

        .group-discount-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2.5rem;
            border-radius: 20px;
            text-align: center;
            margin-top: 3rem;
            box-shadow: 0 15px 35px rgba(102, 126, 234, 0.3);
        }

        .discount-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }

        .group-discount-card h3 {
            font-size: 1.8rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: white;
        }

        .group-discount-card p {
            font-size: 1.1rem;
            margin-bottom: 2rem;
            opacity: 0.9;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }

        .btn-secondary {
            background: white;
            color: #667eea;
            padding: 1rem 2rem;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            font-size: 1rem;
            transition: all 0.3s ease;
            display: inline-block;
        }

        .btn-secondary:hover {
            background: #f8f9fa;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        /* Virtual Seat Section */
        .virtual-seat-section {
            margin-top: 3rem;
        }

        .virtual-seat-toggle {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border: 2px solid #dee2e6;
            border-radius: 15px;
            padding: 1.5rem 2rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .virtual-seat-toggle:hover {
            border-color: var(--primary-color);
            box-shadow: 0 5px 15px rgba(245, 200, 66, 0.2);
        }

        .virtual-seat-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            flex: 1;
        }

        .virtual-seat-icon {
            font-size: 1.5rem;
        }

        .virtual-seat-toggle h3 {
            font-size: 1.3rem;
            font-weight: 600;
            color: var(--dark-gray);
            margin: 0;
            flex: 1;
        }

        .virtual-seat-price {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--primary-color);
            background: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            border: 1px solid var(--primary-color);
        }

        .toggle-arrow {
            font-size: 1.2rem;
            color: var(--medium-gray);
            transition: transform 0.3s ease;
            margin-left: 1rem;
        }

        .toggle-arrow.rotated {
            transform: rotate(180deg);
        }

        .virtual-seat-content {
            margin-top: 1.5rem;
            animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .virtual-seat-card {
            background: white;
            border-radius: 20px;
            padding: 2.5rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(245, 200, 66, 0.2);
        }

        .virtual-seat-note {
            margin-top: 1.5rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 10px;
            font-size: 0.9rem;
            color: #666;
            border-left: 4px solid var(--primary-color);
        }

        @media (max-width: 768px) {
            .virtual-seat-toggle {
                padding: 1rem;
            }

            .virtual-seat-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.5rem;
            }

            .virtual-seat-price {
                font-size: 1rem;
                padding: 0.4rem 0.8rem;
            }

            .virtual-seat-card {
                padding: 2rem;
            }
        }

        /* Contact Section */
        .contact {
            background: var(--gradient-primary);
            color: white;
            padding: 6rem 0;
        }

        .contact-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
        }

        .contact-info h2 {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 1.5rem;
        }

        .contact-info p {
            font-size: 1.1rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }

        .contact-details {
            list-style: none;
        }

        .contact-details li {
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .contact-form {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 2rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 1rem;
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
            color: rgba(255, 255, 255, 0.7);
        }

        .form-group select option {
            color: var(--dark-gray);
            background: white;
        }

        .submit-btn {
            background: white;
            color: var(--brand-dark-blue);
            border: none;
            padding: 1rem 2rem;
            border-radius: 50px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
        }

        .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            background: var(--light-gray);
        }

        /* Honeypot field - hidden from users but visible to bots */
        .honeypot-field {
            position: absolute !important;
            left: -9999px !important;
            width: 1px !important;
            height: 1px !important;
            overflow: hidden !important;
            clip: rect(1px, 1px, 1px, 1px) !important;
            white-space: nowrap !important;
            border: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
        }

        /* Footer */
        footer {
            background: var(--dark-gray);
            color: white;
            padding: 3rem 0 1rem;
            text-align: center;
        }

        /* Animations */
        @keyframes slideInLeft {
            0% {
                opacity: 0;
                transform: translateX(-50px);
            }
            100% {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes slideInRight {
            0% {
                opacity: 0;
                transform: translateX(50px);
            }
            100% {
                opacity: 1;
                transform: translateX(0);
            }
        }

        /* Hide mobile content on desktop */
        .mobile-hero-content {
            display: none;
        }

        /* Call to Action Section */
        .cta-section {
            background: var(--light-gray);
            padding: 3rem 0;
            text-align: center;
        }

        .cta-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .cta-large {
            font-size: 1.2rem;
            padding: 1.2rem 2.5rem;
        }


        /* Mobile Responsive */
        @media (max-width: 768px) {
            .nav-links {
                display: none;
            }

            .nav-container {
                justify-content: space-between;
            }

            .cta-button {
                padding: 0.5rem 1rem;
                font-size: 0.85rem;
            }

            /* Show mobile text, hide desktop text */
            .cta-desktop {
                display: none;
            }

            .cta-mobile {
                display: inline;
            }

            /* Hide all content overlays on mobile */
            .hero.has-video .floating-cards {
                display: none;
            }

            .hero.has-video .video-overlay-content {
                display: none;
            }

            /* Hide hero content during video playback on mobile */
            .hero.has-video .hero-content {
                display: none;
            }

            .hero-container {
                grid-template-columns: 1fr;
                text-align: center;
                gap: 2rem;
                position: relative;
            }

            .hero {
                aspect-ratio: 16/6.75;
                margin-top: 80px;
                position: relative;
            }

            .hero h1 {
                font-size: 2.5rem;
            }

            .video-overlay-content {
                padding: 1rem;
                font-size: 0.9rem;
            }

            .video-overlay-content h3 {
                font-size: 1.2rem;
                margin-bottom: 0.5rem;
            }

            .hero-buttons {
                flex-direction: column;
                align-items: center;
                gap: 0.8rem;
            }

            /* Mobile content below video */
            .mobile-hero-content {
                display: block;
                background: linear-gradient(135deg, #f8fafc 0%, #e1f5fe 100%);
                padding: 2rem 1rem;
                text-align: center;
                box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.1);
            }

            .mobile-hero-content h1 {
                font-size: 2rem;
                font-weight: 800;
                margin-bottom: 1rem;
                color: var(--dark-gray);
                background: var(--gradient-primary);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .mobile-hero-content .hero-stats {
                font-size: 1rem;
                color: var(--medium-gray);
                margin-bottom: 0.5rem;
            }

            .mobile-hero-content .hero-location {
                font-size: 0.9rem;
                color: var(--medium-gray);
                margin-bottom: 2rem;
            }

            .mobile-hero-content .hero-buttons {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1rem;
            }

            /* Reduce testimonials title size on mobile */
            .testimonials .section-header h2 {
                font-size: 1.8rem;
            }

            .testimonials .section-header p {
                font-size: 1rem;
            }

            /* Hide teacher photo section on mobile */
            .testimonials .teacher-photo {
                display: none;
            }

            .testimonials .testimonials-content {
                grid-template-columns: 1fr;
            }

            /* Increase testimonial text size on mobile */
            .testimonials .testimonial-slide p {
                font-size: 1.1rem;
                line-height: 1.6;
            }

            /* Remove bottom margin from section header on mobile */
            .testimonials .section-header {
                margin-bottom: 0;
            }


            /* Increase testimonial card height on mobile */
            .testimonials .carousel-container {
                height: 400px;
            }

            /* Make carousel dots smaller on mobile */
            .testimonials .dot {
                width: 8px;
                height: 8px;
            }

            /* Make about educator title consistent with other mobile titles */
            .about-educator .section-header h2 {
                font-size: 1.8rem;
            }

            /* Reduce top and bottom padding for all sections on mobile */
            .about-educator,
            .testimonials-revamped,
            .stats,
            .services,
            .contact,
            .cta-section,
            .testimonials,
            .schedule,
            .pricing {
                padding-top: 2rem;
                padding-bottom: 2rem;
            }

            /* Make all section titles consistent size on mobile */
            .section-header h2,
            .testimonials-revamped .section-header h2,
            .services .section-header h2,
            .contact .contact-info h2 {
                font-size: 1.8rem;
            }

            /* Collapsible entire services section on mobile */
            .services .section-header {
                cursor: pointer;
                position: relative;
            }

            .services .section-header::after {
                content: '▼';
                position: absolute;
                top: 50%;
                right: 1rem;
                transform: translateY(-50%);
                color: var(--brand-light-blue);
                font-size: 1.2rem;
                transition: transform 0.3s ease;
            }

            .services.collapsed .section-header::after {
                transform: translateY(-50%) rotate(180deg);
            }

            .services .services-grid {
                display: none;
                overflow: hidden;
            }

            .services.expanded .services-grid {
                display: grid;
                animation: slideDown 0.3s ease-out;
            }

            @keyframes slideDown {
                from {
                    opacity: 0;
                    max-height: 0;
                }
                to {
                    opacity: 1;
                    max-height: 2000px;
                }
            }


            .contact-container {
                grid-template-columns: 1fr;
            }

            .floating-cards {
                width: 300px;
                height: 300px;
            }

            .floating-card {
                width: 150px !important;
            }

            /* Schedule Section Mobile */
            .schedule-grid {
                grid-template-columns: 1fr;
                gap: 2rem;
            }

            .schedule-card {
                padding: 1.5rem;
            }

            .time-options {
                flex-direction: column;
                gap: 0.8rem;
            }

            .time-slot {
                text-align: center;
                padding: 0.8rem;
            }

            .class-description {
                font-size: 0.8rem;
                margin-top: 0.5rem;
                text-align: center;
            }

            /* Schedule Notes Mobile */
            .schedule-notes-grid {
                grid-template-columns: 1fr;
                gap: 1.5rem;
                margin-top: 2rem;
            }

            .schedule-note-card {
                padding: 1.5rem;
            }

            .note-icon {
                font-size: 2rem;
            }

            .schedule-note-card h4 {
                font-size: 1.2rem;
            }

            /* Pricing Section Mobile */
            .pricing-grid {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }

            .pricing-card.featured {
                transform: none;
                order: -1;
            }

            .pricing-card {
                padding: 2rem;
            }

            .amount {
                font-size: 2.5rem;
            }

            .group-discount-card {
                padding: 2rem;
                margin-top: 2rem;
            }

            .group-discount-card h3 {
                font-size: 1.5rem;
            }

            .group-discount-card p {
                font-size: 1rem;
                margin-bottom: 1.5rem;
            }

            .testimonials-content {
                grid-template-columns: 1fr;
                gap: 2rem;
                text-align: center;
            }

            .teacher-photo-wrapper {
                align-items: center;
            }

            .teacher-photo img {
                width: 200px;
                height: 200px;
            }

            .testimonial-slide {
                padding: 1.5rem 1rem;
                height: auto;
                min-height: 280px;
            }

            .testimonial-slide p {
                font-size: 0.85rem;
                line-height: 1.5;
                margin-bottom: 1.5rem;
                max-width: 90%;
                margin-left: auto;
                margin-right: auto;
            }

            .testimonial-slide .review-stars {
                font-size: 1.3rem;
                margin-bottom: 1.2rem;
            }

            .testimonial-slide .reviewer {
                font-size: 0.85rem;
                margin-bottom: 1rem;
            }

            .read-more-link {
                font-size: 0.85rem;
            }

            .carousel-container {
                height: 300px;
            }
        }

        /* Extra small screens */
        @media (max-width: 375px) {
            .services-grid {
                grid-template-columns: 1fr;
                padding: 0 1rem;
            }

            .service-card {
                margin: 0;
                max-width: 100%;
            }

            .hero h1 {
                font-size: 2rem;
            }

            .video-overlay-content {
                padding: 0.8rem;
                font-size: 0.8rem;
            }

            .video-overlay-content h3 {
                font-size: 1rem;
            }

            .hero-buttons .btn-primary,
            .hero-buttons .btn-secondary {
                font-size: 0.9rem;
                padding: 0.8rem 1.5rem;
            }

            .nav-container {
                padding: 0 1rem;
            }

            .hero-container {
                padding: 0 1rem;
            }

            .testimonials-revamped-container {
                padding: 0 1rem;
            }
        }
        /* About the Educator Section */
        .about-educator {
            padding: 6rem 0;
            background: linear-gradient(135deg, #f8fafc 0%, #e1f5fe 100%);
        }

        .about-educator-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .about-educator .section-header {
            text-align: center;
            margin-bottom: 4rem;
        }

        .about-educator .section-header h2 {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 1rem;
            color: var(--brand-dark-blue);
        }

        .educator-content {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 4rem;
            align-items: start;
        }

        .educator-intro h3 {
            font-size: 2rem;
            font-weight: 700;
            color: var(--brand-dark-blue);
            margin-bottom: 0.5rem;
        }

        .educator-title {
            font-size: 1.1rem;
            color: var(--brand-light-blue);
            font-weight: 600;
            margin-bottom: 1.5rem;
        }

        .educator-description {
            font-size: 1.1rem;
            line-height: 1.7;
            color: var(--dark-gray);
        }

        .teaching-videos-carousel h4 {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--brand-dark-blue);
            margin-bottom: 2rem;
            text-align: center;
        }

        .videos-container {
            position: relative;
            overflow: hidden;
            border-radius: 20px;
            background: white;
            padding: 1rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .video-track {
            display: flex;
            transition: transform 0.5s ease;
            gap: 1rem;
        }

        .video-slide {
            min-width: calc(50% - 0.5rem);
            flex-shrink: 0;
        }

        .video-wrapper {
            position: relative;
            width: 100%;
            height: 0;
            padding-bottom: 177.78%; /* 9:16 aspect ratio for shorts */
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .video-wrapper iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }

        .video-label {
            text-align: center;
            margin-top: 1rem;
            font-weight: 600;
            color: var(--brand-dark-blue);
            font-size: 1rem;
        }

        .video-nav-btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.9);
            border: none;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--brand-dark-blue);
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 2;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .video-nav-btn:hover {
            background: white;
            transform: translateY(-50%) scale(1.1);
        }

        .video-prev {
            left: 1rem;
        }

        .video-next {
            right: 1rem;
        }

        .video-indicators {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            margin-top: 1.5rem;
        }

        .video-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: rgba(46, 89, 132, 0.3);
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .video-indicator.active {
            background: var(--brand-dark-blue);
            transform: scale(1.2);
        }

        .mobile-only {
            display: none;
        }

        /* Mobile responsive for about educator */
        @media (max-width: 768px) {
            .educator-intro {
                display: none;
            }

            .educator-content {
                grid-template-columns: 1fr;
                gap: 2rem;
                text-align: center;
            }

            .video-slide {
                min-width: 100%;
            }

            .video-nav-btn {
                width: 40px;
                height: 40px;
                font-size: 1.2rem;
            }

            .video-prev {
                left: 0.5rem;
            }

            .video-next {
                right: 0.5rem;
            }

            .about-educator .section-header h2 {
                font-size: 2rem;
            }

            .mobile-only {
                display: inline-block;
            }

            .educator-intro h3 {
                font-size: 1.5rem;
            }
        }

        @media (max-width: 375px) {
            .about-educator {
                padding: 4rem 0;
            }

            .videos-container {
                padding: 0.5rem;
            }

            .video-wrapper {
                padding-bottom: 177.78%;
            }
        }

        /* Service cards read more functionality */
        .service-summary {
            margin-top: 1rem;
            text-align: center;
        }

        .read-more-service {
            color: var(--brand-light-blue);
            cursor: pointer;
            font-weight: 600;
            font-size: 0.9rem;
            text-decoration: underline;
            transition: color 0.3s ease;
        }

        .read-more-service:hover {
            color: var(--brand-dark-blue);
        }

        .service-details {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid rgba(79, 195, 215, 0.2);
            animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
            from {
                opacity: 0;
                max-height: 0;
            }
            to {
                opacity: 1;
                max-height: 300px;
            }
        }

        .service-details.hiding {
            animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
            from {
                opacity: 1;
                max-height: 300px;
            }
            to {
                opacity: 0;
                max-height: 0;
            }
        }

        .service-details ul {
            margin: 0;
            padding-left: 1.5rem;
        }

        .service-details li {
            margin-bottom: 0.8rem;
            line-height: 1.5;
        }

        .service-details strong {
            color: var(--brand-dark-blue);
        }

        /* Testimonials CTA button */
        .testimonials-cta {
            text-align: center;
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid rgba(79, 195, 215, 0.2);
        }

        .testimonials-trial-btn {
            background: var(--gradient-primary);
            color: white;
            padding: 1.2rem 2.5rem;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            box-shadow: 0 6px 20px rgba(245, 200, 66, 0.3);
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }

        .testimonials-trial-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(245, 200, 66, 0.4);
        }

        /* Mobile responsive for services */
        @media (max-width: 768px) {
            .services-grid {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }

            .service-details li {
                margin-bottom: 0.6rem;
                font-size: 0.95rem;
            }

            .testimonials-cta {
                margin-top: 2rem;
                padding-top: 1.5rem;
            }

            .testimonials-trial-btn {
                padding: 1rem 2rem;
                font-size: 1rem;
            }
        }

      `}</style>

      {/* Navigation */}
      <nav>
        <div className="nav-container">
          <div className="logo">Pentamaths</div>
          <ul className="nav-links">
            <li>
              <a href="#home">Home</a>
            </li>
            <li>
              <a href="#testimonials">Reviews</a>
            </li>
            <li>
              <a href="#teaching-style">About</a>
            </li>
            <li>
              <a href="#services">Programmes</a>
            </li>
            <li>
              <a href="#schedule">Schedule</a>
            </li>
            <li>
              <a href="#pricing">Pricing</a>
            </li>
            <li>
              <a href="#trial">Contact</a>
            </li>
          </ul>
          <a href="#trial" className="cta-button">
            <span className="cta-desktop">Get Started</span>
            <span className="cta-mobile">Book Trial</span>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        {/* Video Background - loads on all devices */}
        {/* {!isMobile && ( */}
        <>
          <video
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            poster="/images/hero-fallback.png"
          >
            <source src="/videos/math-background.webm" type="video/webm" />
            <source src="/videos/math-background.mp4" type="video/mp4" />
          </video>
          <div className="hero-overlay"></div>
        </>
        {/* )} */}

        <div className="hero-container">
          <div className="hero-content">
            <h1>A-Level JC H2 Math Tuition</h1>
            <div className="hero-buttons">
              <a href="#trial" className="btn-primary">
                Book a Trial Lesson
              </a>
            </div>
          </div>

          <div className="hero-visual">
            {/* Floating Cards - hidden when video plays */}
            <div className="floating-cards">
              <div className="floating-card">
                <h3>Vectors</h3>
                <p>Length of Projection</p>
              </div>
              <div className="floating-card">
                <h3>AP/GP</h3>
                <p>Sum to Infinity</p>
              </div>
              <div className="floating-card">
                <h3>Functions</h3>
                <p>Range of Composite Functions</p>
              </div>
            </div>

            {/* Alternative content when video is active */}
            <div className="video-overlay-content">
              <h3>JC H2 Math Tuition | A-Level Math Tuition</h3>
              <p>300+ Students • 75% A Rate</p>
              <div className="video-stats">
                <span>
                  5 min walk from Kovan MRT
                  <br />
                  (a few doors down Lola Cafe)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Hero Content - shown below video on mobile */}
      <div className="mobile-hero-content">
        <h1>A-Level JC H2 Math Tuition</h1>
        <div className="hero-stats">300+ Students • 75% A Rate</div>
        <div className="hero-location">
          5 min walk from Kovan MRT
          <br />
          (a few doors down Lola Cafe)
        </div>
        <div className="hero-buttons">
          <a href="#trial" className="btn-primary">
            Book a Trial Lesson
          </a>
        </div>
      </div>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials">
        <div className="testimonials-container">
          <div className="section-header">
            <h2>Student Success Stories</h2>
            <p>
              Real results from students who've achieved excellence in
              mathematics
            </p>
          </div>

          <div className="testimonials-content">
            <div className="teacher-photo">
              <div className="teacher-photo-wrapper">
                <img
                  src="/images/mrwu/success.png"
                  alt="Mr Wu - Mathematics Success"
                />
                <div className="teacher-info">
                  <h3>Mr Wu</h3>
                  <p>Mathematics Educator</p>
                  <p>Proven Track Record</p>
                </div>
              </div>
            </div>

            <div className="testimonials-carousel">
              <div className="carousel-container">
                <div className="testimonial-slide active">
                  <div className="testimonial-content">
                    <p>
                      "hi mr wu, wanted to thank you for all the help with math!
                      managed to <strong>get an A for H1 math 😊</strong>{" "}
                      everything else was alright!"
                    </p>
                  </div>
                  <div className="testimonial-author">
                    <div className="author-avatar">
                      <img
                        src="/images/schools/ri-logo.png"
                        alt="Raffles Institution"
                        className="school-logo"
                      />
                    </div>
                    <div className="author-info">
                      <h4>JX</h4>
                      <p>RI</p>
                    </div>
                  </div>
                </div>

                <div className="testimonial-slide">
                  <div className="testimonial-content">
                    <p>
                      "HI MR WU <strong>I GOT 90RP</strong> THANK U!!!!! HOORAY"
                    </p>
                  </div>
                  <div className="testimonial-author">
                    <div className="author-avatar">
                      <img
                        src="/images/schools/ejc-logo.png"
                        alt="Eunoia Junior College"
                        className="school-logo"
                      />
                    </div>
                    <div className="author-info">
                      <h4>Z</h4>
                      <p>EJC</p>
                    </div>
                  </div>
                </div>

                <div className="testimonial-slide">
                  <div className="testimonial-content">
                    <p>
                      "Hi Mr Wu! <strong>I got A for Maths!!</strong> Thank you
                      so much for all your help and guidance!! 🙏🙏🫶🫶"
                    </p>
                  </div>
                  <div className="testimonial-author">
                    <div className="author-avatar">
                      <img
                        src="/images/schools/sajc-logo.png"
                        alt="Saint Andrew's Junior College"
                        className="school-logo"
                      />
                    </div>
                    <div className="author-info">
                      <h4>V</h4>
                      <p>SAJC</p>
                    </div>
                  </div>
                </div>

                <div className="testimonial-slide">
                  <div className="testimonial-content">
                    <p>
                      "OMG Mr Wu!! <strong>I actually got B for H2 Math</strong>{" "}
                      😭✨ was literally failing everything before joining your
                      class lol. Thanks for not giving up on me even when I kept
                      asking the same questions 😅💯"
                    </p>
                  </div>
                  <div className="testimonial-author">
                    <div className="author-avatar">
                      <img
                        src="/images/schools/tmjc-logo.png"
                        alt="Tampines Meridian Junior College"
                        className="school-logo"
                      />
                    </div>
                    <div className="author-info">
                      <h4>K</h4>
                      <p>TMJC</p>
                    </div>
                  </div>
                </div>

                <div className="testimonial-slide">
                  <div className="testimonial-content">
                    <p>
                      "Mr Wu is literally the GOAT 🐐✨ went from{" "}
                      <strong>barely passing to getting A</strong> for A
                      levels!! His explanations just hit different fr 🔥 highly
                      recommend if you're struggling with math 📈💪"
                    </p>
                  </div>
                  <div className="testimonial-author">
                    <div className="author-avatar">
                      <img
                        src="/images/schools/asrjc-logo.png"
                        alt="Anderson Serangoon Junior College"
                        className="school-logo"
                      />
                    </div>
                    <div className="author-info">
                      <h4>M</h4>
                      <p>ASRJC</p>
                    </div>
                  </div>
                </div>

                <div className="testimonial-slide">
                  <div className="testimonial-content">
                    <p>
                      "no cap Mr Wu saved my math grade 💯 was getting straight
                      Us before his class 😭
                      <strong>I got a B!</strong> tysm 🥺✨"
                    </p>
                  </div>
                  <div className="testimonial-author">
                    <div className="author-avatar">
                      <img
                        src="/images/schools/sajc-logo.png"
                        alt="Saint Andrew's Junior College"
                        className="school-logo"
                      />
                    </div>
                    <div className="author-info">
                      <h4>K</h4>
                      <p>SAJC</p>
                    </div>
                  </div>
                </div>

                <div className="testimonial-slide">
                  <div className="testimonial-content">
                    <p>
                      "Mr Wu is such a vibe!! 😎 makes math actually fun ngl 😂
                      went from <strong>S to B for H2 math</strong>"
                    </p>
                  </div>
                  <div className="testimonial-author">
                    <div className="author-avatar">
                      <img
                        src="/images/schools/nyjc-logo.png"
                        alt="Nanyang Junior College"
                        className="school-logo"
                      />
                    </div>
                    <div className="author-info">
                      <h4>A</h4>
                      <p>NYJC</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="carousel-dots">
                <span
                  className="dot active"
                  onClick={() => currentTestimonialSlide(1)}
                ></span>
                <span
                  className="dot"
                  onClick={() => currentTestimonialSlide(2)}
                ></span>
                <span
                  className="dot"
                  onClick={() => currentTestimonialSlide(3)}
                ></span>
                <span
                  className="dot"
                  onClick={() => currentTestimonialSlide(4)}
                ></span>
                <span
                  className="dot"
                  onClick={() => currentTestimonialSlide(5)}
                ></span>
                <span
                  className="dot"
                  onClick={() => currentTestimonialSlide(6)}
                ></span>
                <span
                  className="dot"
                  onClick={() => currentTestimonialSlide(7)}
                ></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-number">300+</span>
            <div className="stat-label">Students Guided</div>
          </div>
          <div className="stat-item">
            <span className="stat-number">75%</span>
            <div className="stat-label">A1/A2/A Rate</div>
          </div>
          <div className="stat-item">
            <span className="stat-number">20+</span>
            <div className="stat-label">Years Experience</div>
          </div>
          <div className="stat-item">
            <span className="stat-number">2</span>
            <div className="stat-label">Average Grade Improvement</div>
          </div>
        </div>
      </section>

      {/* About the Educator Section */}
      <section id="teaching-style" className="about-educator">
        <div className="about-educator-container">
          <div className="section-header">
            <h2>Hi, I'm Mr Wu!</h2>
            <p>Watch Mr Wu in action - see his teaching style and approach</p>
          </div>

          <div className="educator-content">
            <div className="educator-intro">
              <h3>Mr Wu</h3>
              <p className="educator-title">
                Mathematics Educator • 20+ Years Experience
              </p>
              <p className="educator-description">
                Specializing in Upper Secondary A Mathematics and JC H2
                Mathematics, Mr Wu has guided hundreds of students to achieve
                their academic goals through clear explanations and proven
                teaching methods.
              </p>
            </div>

            <div className="teaching-videos-carousel">
              <h4>Sample Teaching Videos</h4>
              <div className="videos-container">
                <div className="video-track" id="videoTrack">
                  <div className="video-slide">
                    <div className="video-wrapper">
                      <iframe
                        src="https://www.youtube.com/embed/bokhYBCU34Q"
                        title="Integration: Solids of Revolution"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <p className="video-label">
                      Integration: Solids of Revolution
                    </p>
                  </div>

                  <div className="video-slide">
                    <div className="video-wrapper">
                      <iframe
                        src="https://www.youtube.com/embed/lyUwFZkNaZg"
                        title="Integration: why is area negative?"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <p className="video-label">
                      Integration: why is area negative?
                    </p>
                  </div>

                  <div className="video-slide">
                    <div className="video-wrapper">
                      <iframe
                        src="https://www.youtube.com/embed/aBXwVA6fCfY"
                        title="Complex Numbers Teaching"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <p className="video-label">Complex Numbers</p>
                  </div>
                </div>

                <button className="video-nav-btn video-prev" id="videoPrev">
                  ‹
                </button>
                <button className="video-nav-btn video-next" id="videoNext">
                  ›
                </button>
              </div>

              <div className="video-indicators">
                <span className="video-indicator active" data-slide="0"></span>
                <span className="video-indicator" data-slide="1"></span>
                <span
                  className="video-indicator mobile-only"
                  data-slide="2"
                ></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-revamped">
        <div className="testimonials-revamped-container">
          <div className="section-header">
            <h2>What Students & Parents Say</h2>
            <p>Real stories from our mathematics community</p>
          </div>

          <div className="testimonials-content">
            <div className="teacher-photo">
              <div className="teacher-photo-wrapper">
                <img
                  src="/images/mrwu/thumbsup.png"
                  alt="Mr Wu - Mathematics Tutor"
                />
                <div className="teacher-info">
                  <h3>Mr Wu</h3>
                  <p>Mathematics Educator</p>
                  <p>20+ Years Experience</p>
                </div>
              </div>
            </div>

            <div className="testimonials-carousel">
              <div className="carousel-container">
                <div className="testimonial-slide active">
                  <div className="review-stars">★★★★★</div>
                  <p>
                    "I attended the <strong>sec 4 amath class</strong> and{" "}
                    <strong>jumped from F9 to A1 for O levels</strong>. Mr Wu is
                    really patient in guiding the class...{" "}
                    <span
                      className="read-more-link"
                      onClick={() =>
                        setModalReview({
                          title: "Amazing Grade Improvement",
                          content:
                            "I attended the sec 4 amath class last year and I jumped from a F9 for sec 3 eoy to an A1 for o levels. Mr Wu is really patient in guiding the class as well as in providing help for emath which I also scored an A1 for o levels.",
                          reviewer: "C",
                        })
                      }
                    >
                      read more
                    </span>
                    "
                  </p>
                  <div className="reviewer">- C</div>
                </div>

                <div className="testimonial-slide">
                  <div className="review-stars">★★★★★</div>
                  <p>
                    "Both my daughters have been with Pentagon Learning, one
                    doing <strong>A Math</strong> and another{" "}
                    <strong>A' levels H2 Math</strong>.{" "}
                    <strong>Mr Wu has the patience of a Saint</strong>...{" "}
                    <span
                      className="read-more-link"
                      onClick={() =>
                        setModalReview({
                          title: "Excellent for Both A Math & H2 Math",
                          content:
                            "Both my daughters have been with Pentagon Learning for a couple of years, one doing A Math and another just completed A' levels H2 Math. Mr Wu has the patience of a Saint. He believes that Mathematics is about understanding how concepts work instead of just memorizing a bunch of formulas. He ignites the curiosity of his students by encouraging them to ask many questions and shows them the Beauty of Mathematics. He comes up with creative ways to help his students understand different concepts, challenging them to try out different ways to solve questions. My daughters have become better and more confident as they tackled challenging questions.",
                          reviewer: "ELQ",
                        })
                      }
                    >
                      read more
                    </span>
                    "
                  </p>
                  <div className="reviewer">- ELQ</div>
                </div>

                <div className="testimonial-slide">
                  <div className="review-stars">★★★★★</div>
                  <p>
                    "I was struggling with{" "}
                    <strong>amaths and could barely do homework</strong>.{" "}
                    <strong>
                      Mr Wu simplifies complicated concepts with real-life
                      examples
                    </strong>
                    . He will answer questions within minutes...{" "}
                    <span
                      className="read-more-link"
                      onClick={() =>
                        setModalReview({
                          title: "From Struggling to Success",
                          content:
                            "Hi! I am a 2022 secondary 4 student and joined the tuition in june. I was struggling with my amaths and could barely do any of my homework, and I decided to join the tuition center from reccomandation from my classmates. And I did not regret this decision one bit! Mr wu is a really good teacher. You can tell his enthusiasm for maths through his enthusiasm in lessons. He likes to simplify complicated math concepts by relating them to our real-life experinces, making it much easier to swallow down and understand During breaks, he will tell us about some fun math facts! Whenever I have a question, i can always drop him a message and he will answer me within a few minutes! In fact, he always encourages us to ask more questions! Before an exam, he will always ensure that we are well prepare. He will go through any topics that we may be more confused on, and goes through quite a few papers and makes sure we do sufficient practise! sometimes he also gave us advice on our past secondary choices and told us about what he did too! In the end, i jumped from a F9 grade to an a2 grade, so i think this really shows how good of a teacher he is!",
                          reviewer: "Chong JX",
                        })
                      }
                    >
                      read more
                    </span>
                    "
                  </p>
                  <div className="reviewer">- Chong JX</div>
                </div>

                <div className="testimonial-slide">
                  <div className="review-stars">★★★★★</div>
                  <p>
                    "Mr Wu is a{" "}
                    <strong>
                      competent tutor who relates his teaching very well
                    </strong>{" "}
                    to my child. He is able to{" "}
                    <strong>
                      stimulate interests in math and motivate them to maximise
                      their potential
                    </strong>
                    ...{" "}
                    <span
                      className="read-more-link"
                      onClick={() =>
                        setModalReview({
                          title: "Competent & Motivating Tutor",
                          content:
                            "Mr Wu is a competent tutor who is able to relate his teaching very well to my child. He is able to stimulate the interests of his students in math and motivate them to maximise their potential in learning. His patience and joviality have won his students' hearts.",
                          reviewer: "N Koh",
                        })
                      }
                    >
                      read more
                    </span>
                    "
                  </p>
                  <div className="reviewer">- N Koh</div>
                </div>

                <div className="testimonial-slide">
                  <div className="review-stars">★★★★★</div>
                  <p>
                    "<strong>A Truly Exceptional Math Teacher</strong> - I
                    highly recommend Mr. Wu for anyone seeking to deepen their
                    understanding of <strong>H2 Math</strong>. He has a{" "}
                    <strong>
                      remarkable ability to simplify complex concepts
                    </strong>
                    ...{" "}
                    <span
                      className="read-more-link"
                      onClick={() =>
                        setModalReview({
                          title: "A Truly Exceptional H2 Math Teacher",
                          content:
                            "I highly recommend Mr. Wu at Pentagon Learning for anyone seeking to deepen their understanding of H2 Math. He is a truly exceptional educator who brings a unique and highly effective perspective to teaching. Mr. Wu has a remarkable ability to simplify complex concepts, making them accessible and intuitive. His innovative teaching methods not only helped me grasp challenging topics but also ignited a genuine interest in the subject. If you are looking for a teacher who can truly help you learn from the best and see math in a new light, Mr. Wu is the one to choose. The profound knowledge and insights you gain from his classes are an invaluable investment, far more rewarding than any temporary incentive. His dedication and approach make him an invaluable resource.",
                          reviewer: "M Tang",
                        })
                      }
                    >
                      read more
                    </span>
                    "
                  </p>
                  <div className="reviewer">- M Tang</div>
                </div>
              </div>

              <div className="carousel-dots">
                <span
                  className="dot active"
                  onClick={() => currentSlide(1)}
                ></span>
                <span className="dot" onClick={() => currentSlide(2)}></span>
                <span className="dot" onClick={() => currentSlide(3)}></span>
                <span className="dot" onClick={() => currentSlide(4)}></span>
                <span className="dot" onClick={() => currentSlide(5)}></span>
              </div>
            </div>
          </div>

          <div className="testimonials-cta">
            <a href="#trial" className="btn-primary testimonials-trial-btn">
              Book Your Trial Lesson Today
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services">
        <div className="services-container">
          <div className="section-header">
            <h2>Mathematics Programmes</h2>
            <p>
              Specialized tuition for Singapore's mathematics curriculum with
              proven teaching methodologies
            </p>
          </div>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">📐</div>
              <h3>A Mathematics (Upper Sec)</h3>
              <p>
                Master Additional Mathematics for Sec 3 & 4 students with proven
                teaching methods.
              </p>
              <div className="service-summary">
                <span
                  className="read-more-service"
                  onClick={() => toggleServiceDetails("a-math")}
                >
                  {serviceDetailsVisible["a-math"] ? "read less" : "read more"}
                </span>
              </div>
              {serviceDetailsVisible["a-math"] && (
                <div className="service-details">
                  <ul className="service-features">
                    <li>Trigonometry & Coordinate Geometry</li>
                    <li>Calculus (Differentiation & Integration)</li>
                    <li>Exponential & Logarithmic Functions</li>
                    <li>Past Year Papers & Exam Techniques</li>
                    <li>Personalized learning pace</li>
                    <li>Regular progress assessments</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="service-card">
              <div className="service-icon">📊</div>
              <h3>H2 Mathematics (JC)</h3>
              <p>
                Comprehensive A-Level H2 Mathematics tuition covering the
                complete syllabus.
              </p>
              <div className="service-summary">
                <span
                  className="read-more-service"
                  onClick={() => toggleServiceDetails("h2-math")}
                >
                  {serviceDetailsVisible["h2-math"] ? "read less" : "read more"}
                </span>
              </div>
              {serviceDetailsVisible["h2-math"] && (
                <div className="service-details">
                  <ul className="service-features">
                    <li>Pure Mathematics (Functions, Calculus)</li>
                    <li>Statistics (Probability, Distributions)</li>
                    <li>A-Level Exam Strategies & Techniques</li>
                    <li>Past year paper analysis</li>
                    <li>Mock examinations & practice tests</li>
                    <li>University preparation guidance</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="service-card">
              <div className="service-icon">🎯</div>
              <h3>Teaching Options</h3>
              <p>
                Flexible learning formats tailored to your preferences and
                learning style.
              </p>
              <div className="service-summary">
                <span
                  className="read-more-service"
                  onClick={() => toggleServiceDetails("teaching-options")}
                >
                  {serviceDetailsVisible["teaching-options"]
                    ? "read less"
                    : "read more"}
                </span>
              </div>
              {serviceDetailsVisible["teaching-options"] && (
                <div className="service-details">
                  <ul className="service-features">
                    <li>
                      <strong>One-on-One:</strong> Personalized attention &
                      flexible scheduling
                    </li>
                    <li>
                      <strong>Small Groups:</strong> 3-6 students, collaborative
                      learning
                    </li>
                    <li>
                      <strong>Exam Preparation:</strong> Intensive pre-exam
                      courses
                    </li>
                    <li>
                      <strong>Holiday Revision:</strong> June & December
                      intensive programs
                    </li>
                    <li>
                      <strong>Topical Lessons:</strong> Target specific weak
                      areas
                    </li>
                    <li>
                      <strong>Online Options:</strong> Convenient remote
                      learning
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section id="schedule" className="schedule">
        <div className="schedule-container">
          <div className="section-header">
            <h2>H2 Math Tuition Class Schedule</h2>
            <p>
              Choose from our available time slots for both individual and group
              sessions
            </p>
          </div>
          <div className="schedule-grid">
            <div className="schedule-card">
              <h3>📅 Weekly Schedule JC1 2025</h3>
              <div className="time-slots">
                <div className="day-slot">
                  <h4>Monday - Catch Up Class</h4>
                  <div className="time-options">
                    <span
                      className={`time-slot available catchup ${selectedTimeSlots.includes("JC1 2025 Monday 6:00 PM - 8:00 PM (Catch Up)") ? "selected" : ""}`}
                      onClick={() =>
                        handleTimeSlotClick(
                          "JC1 2025 Monday 6:00 PM - 8:00 PM (Catch Up)",
                        )
                      }
                    >
                      6:00 PM - 8:00 PM
                    </span>
                  </div>
                  <p className="class-description">
                    J1 Pure Topics comprehensive revision
                  </p>
                </div>
                <div className="day-slot">
                  <h4>Thursday - Catch Up Class</h4>
                  <div className="time-options">
                    <span
                      className={`time-slot available catchup ${selectedTimeSlots.includes("JC1 2025 Thursday 4:00 PM - 6:00 PM (Catch Up)") ? "selected" : ""}`}
                      onClick={() =>
                        handleTimeSlotClick(
                          "JC1 2025 Thursday 4:00 PM - 6:00 PM (Catch Up)",
                        )
                      }
                    >
                      4:00 PM - 6:00 PM
                    </span>
                  </div>
                  <p className="class-description">
                    J1 Pure Topics comprehensive revision
                  </p>
                </div>
                <div className="day-slot">
                  <h4>Saturday</h4>
                  <div className="time-options">
                    <span
                      className={`time-slot available h2-math ${selectedTimeSlots.includes("JC1 2025 Saturday 11:00 AM - 1:00 PM (H2 Math)") ? "selected" : ""}`}
                      onClick={() =>
                        handleTimeSlotClick(
                          "JC1 2025 Saturday 11:00 AM - 1:00 PM (H2 Math)",
                        )
                      }
                    >
                      11:00 AM - 1:00 PM
                    </span>
                    <span
                      className={`time-slot available h2-math ${selectedTimeSlots.includes("JC1 2025 Saturday 4:00 PM - 6:00 PM (H2 Math)") ? "selected" : ""}`}
                      onClick={() =>
                        handleTimeSlotClick(
                          "JC1 2025 Saturday 4:00 PM - 6:00 PM (H2 Math)",
                        )
                      }
                    >
                      4:00 PM - 6:00 PM
                    </span>
                  </div>
                  <p className="class-description">
                    Keep up with school syllabus
                  </p>
                </div>
                <div className="day-slot">
                  <p className="class-description">
                    <span className="h2-color">■ H2 Math Tuition</span> |
                    <span className="catchup-color">■ Catch Up Class</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="schedule-card">
              <h3>📅 Weekly Schedule JC1 2026</h3>
              <div className="time-slots">
                <div className="day-slot">
                  <h4>Tuesday - Catch Up Class</h4>
                  <div className="time-options">
                    <span
                      className={`time-slot available catchup ${selectedTimeSlots.includes("JC1 2026 Tuesday 6:00 PM - 8:00 PM (Catch Up)") ? "selected" : ""}`}
                      onClick={() =>
                        handleTimeSlotClick(
                          "JC1 2026 Tuesday 6:00 PM - 8:00 PM (Catch Up)",
                        )
                      }
                    >
                      6:00 PM - 8:00 PM
                    </span>
                  </div>
                  <p className="class-description">
                    J1 Pure Topics comprehensive revision
                  </p>
                </div>
                <div className="day-slot">
                  <h4>Saturday - H2 Math Tuition</h4>
                  <div className="time-options">
                    <span
                      className={`time-slot available h2-math ${selectedTimeSlots.includes("JC1 2026 Saturday 8:00 AM - 10:00 AM (H2 Math)") ? "selected" : ""}`}
                      onClick={() =>
                        handleTimeSlotClick(
                          "JC1 2026 Saturday 8:00 AM - 10:00 AM (H2 Math)",
                        )
                      }
                    >
                      8:00 AM - 10:00 AM
                    </span>
                  </div>
                  <p className="class-description">
                    Keep up with school syllabus
                  </p>
                </div>
                <div className="day-slot">
                  <p className="class-description">
                    <span className="h2-color">■ H2 Math Tuition</span> |
                    <span className="catchup-color">■ Catch Up Class</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="schedule-notes-grid">
            <a
              href="https://wa.me/6583493435?text=Hi!%20I'm%20interested%20in%20A%20Maths%20tuition.%20Could%20you%20please%20tell%20me%20more%20about%20the%20available%20time%20slots%20and%20pricing?"
              target="_blank"
              rel="noopener noreferrer"
              className="schedule-note-card clickable-card"
            >
              <div className="note-icon">📞</div>
              <h4>A Maths Tuition Available</h4>
              <p>Additional Mathematics classes for Secondary students</p>
              <div className="note-cta-text">WhatsApp us to enquire!</div>
            </a>
            <a
              href={`https://wa.me/6583493435?text=${encodeURIComponent(generateH2MathScheduleMessage())}`}
              target="_blank"
              rel="noopener noreferrer"
              className="schedule-note-card clickable-card"
            >
              <div className="note-icon">📅</div>
              <h4>H2 Math Schedule Inquiry</h4>
              <p>Need different timings or future cohort information?</p>
              <div className="note-cta-text">Ask about other timings</div>
            </a>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing">
        <div className="pricing-container">
          <div className="section-header">
            <h2>Pricing Plans</h2>
            <p>
              Transparent pricing with no hidden fees, deposits or upfront
              payment to lock you down!
            </p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>H2 Math Tuition</h3>
                <div className="price">
                  <span className="currency">S$</span>
                  <span className="amount">430</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li>✓ 2 hours per week</li>
                <li>✓ Stay on track with current school syllabus</li>
                <li>✓ Online Lesson Available</li>
                <li>✓ Homework support</li>
              </ul>
            </div>
            <div className="pricing-card featured">
              <div className="pricing-badge">Most Popular</div>
              <div className="pricing-header">
                <h3>H2 Math Tuition + Catch Up Class</h3>
                <div className="price">
                  <span className="currency">S$</span>
                  <span className="amount">570</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li>
                  ✓ <strong>4 hours per week</strong>
                </li>
                <li>
                  ✓ Double protection: Fill your knowledge gaps AND keep up with
                  school
                </li>
                <li>✓ S$290 savings vs taking both classes separately</li>
                <li>✓ Free materials included</li>
                <li>✓ Access to Recorded Lessons</li>
              </ul>
            </div>
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Catch Up Class</h3>
                <div className="price">
                  <span className="currency">S$</span>
                  <span className="amount">430</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li>✓ 2 hours per week</li>
                <li>✓ Fill the gaps from J1 that still confuse you</li>
                <li>✓ Online Lesson Available</li>
                <li>✓ Homework support</li>
              </ul>
            </div>
          </div>
          <div className="group-discount-card">
            <div className="discount-icon">👥</div>
            <h3>Bring a Friend & Save Even More!</h3>
            <p>
              Additional discounts available when you attend classes with
              friends. The more friends you bring, the more everyone saves!
            </p>
            <div className="discount-cta">
              <a
                href={`https://wa.me/6583493435?text=${encodeURIComponent(generateWhatsAppMessage())}`}
                className="btn-secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ask About Group Discounts
              </a>
            </div>
          </div>

          {/* Virtual Seat Option - Collapsible */}
          <div className="virtual-seat-section">
            <div
              className="virtual-seat-toggle"
              onClick={() => setShowVirtualSeat(!showVirtualSeat)}
            >
              <div className="virtual-seat-header">
                <span className="virtual-seat-icon">💻</span>
                <h3>Looking for a More Budget-Friendly Option?</h3>
                <span className="virtual-seat-price">
                  Starting from S$210/month
                </span>
              </div>
              <div
                className={`toggle-arrow ${showVirtualSeat ? "rotated" : ""}`}
              >
                ▼
              </div>
            </div>

            {showVirtualSeat && (
              <div className="virtual-seat-content">
                <div className="virtual-seat-card">
                  <div className="pricing-header">
                    <h3>Virtual Seat</h3>
                    <div className="price">
                      <span className="currency">S$</span>
                      <span className="amount">210</span>
                      <span className="period">/month</span>
                    </div>
                  </div>
                  <ul className="pricing-features">
                    <li>✓ 2 hours per week</li>
                    <li>✓ Course materials (digital only)</li>
                    <li>✓ Access to recorded sessions</li>
                    <li>✓ Basic homework support via chat</li>
                    <li>✓ General Q&A via chat (response not guaranteed)</li>
                    <li>✗ Instructor prioritizes physical class students</li>
                    <li>✗ No instant feedback while working on problems</li>
                  </ul>
                  <div className="virtual-seat-note">
                    <strong>Best For:</strong> Students who want to preview the
                    content or have budget constraints but understand they're
                    getting a significantly reduced experience.
                  </div>
                  <div className="pricing-cta">
                    <a
                      href={`https://wa.me/6583493435?text=Hi! I'm interested in the Virtual Seat option for S$210/month. Could you tell me more about how it works?`}
                      className="btn-primary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ask About Virtual Seat
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="trial" className="contact">
        <div className="contact-container">
          <div className="contact-info">
            <h2>Ready to Excel in Mathematics?</h2>
            <p>
              Contact us today to schedule a trial lesson and discover how
              Pentamaths can help you achieve your academic goals.
            </p>
            <ul className="contact-details">
              <li>📧 ask@pentamaths.sg</li>
              <li>📱 +65 8349 3435</li>
              <li>📍 17 Simon Road, #02-01, Singapore</li>
              <li>🌐 facebook.com/pentamathsfb</li>
            </ul>
          </div>
          <div className="contact-form">
            <form onSubmit={handleFormSubmit}>
              {/* Advanced Honeypot fields - hidden from users but look legitimate to bots */}
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="honeypot-field"
                placeholder="Your website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="honeypot-field"
                placeholder="Phone number"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="honeypot-field"
                placeholder="Company name"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="form-group">
                <label>Subject Level</label>
                <select
                  name="subjectLevel"
                  value={formData.subjectLevel}
                  onChange={handleInputChange}
                >
                  <option value="">Select your level</option>

                  {/* Valid options - what we actually offer (in priority order) */}
                  <option value="h2-maths">H2 Mathematics (JC)</option>
                  <option value="h1-maths">H1 Mathematics (JC)</option>
                  <option value="a-maths">A Mathematics (Sec 3-4)</option>

                  {/* Honeypot options - these will trigger spam detection */}
                  <option value="primary-maths">Primary 1 Mathematics</option>
                  <option value="primary-maths">Primary 2 Mathematics</option>
                  <option value="primary-maths">Primary 3 Mathematics</option>
                  <option value="primary-maths">Primary 4 Mathematics</option>
                  <option value="primary-maths">Primary 5 Mathematics</option>
                  <option value="primary-maths">Primary 6 Mathematics</option>
                </select>
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Tell us about your current mathematics level and learning goals..."
                  required
                ></textarea>
              </div>

              {/* Google reCAPTCHA Enterprise runs invisibly in the background */}
              {recaptchaLoaded && (
                <div className="form-group">
                  <small
                    style={{ color: "var(--medium-gray)", fontSize: "0.85rem" }}
                  >
                    🛡️ This form is protected by Google reCAPTCHA Enterprise
                  </small>
                </div>
              )}

              <button
                type="submit"
                className="submit-btn"
                disabled={formSubmitting}
              >
                {formSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div>
          <p>&copy; 2025 Pentagon Learning. All rights reserved.</p>
        </div>
      </footer>

      {/* Review Modal */}
      {modalReview && (
        <div className="modal-overlay" onClick={() => setModalReview(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setModalReview(null)}
            >
              ×
            </button>
            <h3>{modalReview.title}</h3>
            <div className="modal-stars">★★★★★</div>
            <div className="modal-text">{modalReview.content}</div>
            <div className="modal-reviewer">- {modalReview.reviewer}</div>
          </div>
        </div>
      )}
    </div>
  );
}

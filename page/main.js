/* ========================================================
   YuHai Portal — Main Script
   ======================================================== */

;(function () {
  'use strict'

  // ─── NAV SCROLL EFFECT ───
  const nav = document.getElementById('nav')
  let lastScroll = 0

  function onScroll() {
    const y = window.scrollY
    nav.classList.toggle('scrolled', y > 40)
    lastScroll = y
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  // ─── MOBILE NAV TOGGLE ───
  const toggle = document.getElementById('navToggle')
  const navLinks = document.getElementById('navLinks')

  if (toggle) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open')
      const isOpen = navLinks.classList.contains('open')
      toggle.setAttribute('aria-expanded', isOpen)
    })

    // Close on link click
    navLinks.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open')
        toggle.setAttribute('aria-expanded', false)
      })
    })
  }

  // ─── SCROLL REVEAL ───
  function initReveal() {
    const selectors = [
      '.feature-card',
      '.highlight-card',
      '.arch-layer',
      '.tech-item',
      '.step',
      '.faq-item',
      '.cta-inner',
      '.section-header',
      '.comparison-table-wrapper'
    ]

    const els = document.querySelectorAll(selectors.join(','))
    els.forEach((el) => el.classList.add('reveal'))

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // stagger children
            const parent = entry.target.parentElement
            if (parent) {
              const siblings = Array.from(parent.querySelectorAll('.reveal'))
              const idx = siblings.indexOf(entry.target)
              entry.target.style.transitionDelay = `${idx * 60}ms`
            }
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    els.forEach((el) => observer.observe(el))
  }

  // ─── COUNT-UP ANIMATION ───
  function initCountUp() {
    const statValues = document.querySelectorAll('.stat-value[data-count]')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target
            const target = parseInt(el.dataset.count, 10)
            animateCount(el, 0, target, 1200)
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.5 }
    )

    statValues.forEach((el) => observer.observe(el))
  }

  function animateCount(el, start, end, duration) {
    const range = end - start
    const startTime = performance.now()

    function update(now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // easeOutExpo
      const eased = 1 - Math.pow(1 - progress, 4)
      const current = Math.round(start + range * eased)
      el.textContent = current
      if (progress < 1) requestAnimationFrame(update)
    }

    requestAnimationFrame(update)
  }

  // ─── CODE TABS ───
  function initCodeTabs() {
    const tabs = document.querySelectorAll('.code-tab')
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const block = tab.closest('.code-block')
        block.querySelectorAll('.code-tab').forEach((t) => t.classList.remove('active'))
        block.querySelectorAll('.code-panel').forEach((p) => p.classList.remove('active'))
        tab.classList.add('active')
        const panel = block.querySelector(`#panel-${tab.dataset.target}`)
        if (panel) panel.classList.add('active')
      })
    })
  }

  // ─── ACTIVE NAV LINK ───
  function initActiveNav() {
    const sections = document.querySelectorAll('section[id]')
    const links = document.querySelectorAll('.nav-link')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id
            links.forEach((link) => {
              link.classList.toggle('active', link.getAttribute('href') === `#${id}`)
            })
          }
        })
      },
      { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' }
    )

    sections.forEach((s) => observer.observe(s))
  }

  // ─── SMOOTH ANCHOR SCROLL ───
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href')
      if (href === '#') return
      const target = document.querySelector(href)
      if (target) {
        e.preventDefault()
        const y = target.getBoundingClientRect().top + window.scrollY - 80
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    })
  })

  // ─── INIT ───
  document.addEventListener('DOMContentLoaded', () => {
    initReveal()
    initCountUp()
    initCodeTabs()
    initActiveNav()
  })
})()

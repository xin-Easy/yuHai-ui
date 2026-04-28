/* ========================================================
   YuHai Portal — Main Script
   ======================================================== */

; (function () {
  'use strict'

  // ─── 等待Clerk加载 ───
  async function waitForClerk(maxAttempts = 30) {
    let attempts = 0
    while (attempts < maxAttempts) {
      if (window.Clerk?.session) {
        return true
      }
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
    return false
  }

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

  // ─── CONSOLE MODAL ───
  function initConsoleModal() {
    const consoleModal = document.getElementById('console-modal')
    const closeBtn = document.getElementById('close-console-btn')
    const apiKeysList = document.getElementById('apiKeysList')
    const createKeyBtn = document.getElementById('btn-create-key')
    const createKeyModal = document.getElementById('create-key-modal')
    const cancelCreateBtn = document.getElementById('btn-cancel-create-key')
    const confirmCreateBtn = document.getElementById('btn-confirm-create-key')
    const keyNameInput = document.getElementById('keyNameInput')
    const newKeyDisplay = document.getElementById('newKeyDisplay')
    const newKeyText = document.getElementById('newKeyText')
    const copyNewKeyBtn = document.getElementById('btn-copy-new-key')

    if (!consoleModal) return

    // Close modal
    function closeModal() {
      consoleModal.style.display = 'none'
      document.body.style.overflow = 'auto'
    }

    // Close create key modal
    function closeCreateKeyModal() {
      createKeyModal.classList.remove('active')
      keyNameInput.value = ''
      newKeyDisplay.style.display = 'none'
    }

    // Close button
    closeBtn?.addEventListener('click', closeModal)

    // Click outside to close
    consoleModal.addEventListener('click', (e) => {
      if (e.target === consoleModal) {
        closeModal()
      }
    })

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && consoleModal.style.display === 'block') {
        closeModal()
      }
      if (e.key === 'Escape' && createKeyModal.classList.contains('active')) {
        closeCreateKeyModal()
      }
    })

    // Open create key modal
    createKeyBtn?.addEventListener('click', () => {
      createKeyModal.classList.add('active')
    })

    // Cancel create
    cancelCreateBtn?.addEventListener('click', closeCreateKeyModal)

    // Copy new key
    copyNewKeyBtn?.addEventListener('click', () => {
      const key = newKeyText.textContent
      if (key) {
        navigator.clipboard.writeText(key)
        copyNewKeyBtn.style.color = '#34d399'
        setTimeout(() => {
          copyNewKeyBtn.style.color = ''
        }, 2000)
      }
    })

    // Create key
    confirmCreateBtn?.addEventListener('click', async () => {
      const name = keyNameInput.value.trim()
      if (!name) {
        alert('请输入Key名称')
        return
      }

      if (!await waitForClerk()) {
        alert('认证加载中，请稍后...')
        return
      }

      confirmCreateBtn.disabled = true
      confirmCreateBtn.textContent = '创建中...'

      try {
        const token = await Clerk.session.getToken()
        const response = await fetch('/api/api-keys', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name
          })
        })

        const result = await response.json()

        if (result.success && result.data) {
          newKeyText.textContent = result.data.key
          newKeyDisplay.style.display = 'block'
          confirmCreateBtn.textContent = '已创建'
          
          // Refresh list after 2 seconds
          setTimeout(() => {
            loadApiKeys()
            closeCreateKeyModal()
            confirmCreateBtn.textContent = '创建'
          }, 2000)
        } else {
          alert(result.error || '创建失败')
          confirmCreateBtn.textContent = '创建'
        }
      } catch (error) {
        console.error('Create key error:', error)
        alert('创建失败: ' + error.message)
        confirmCreateBtn.textContent = '创建'
      } finally {
        confirmCreateBtn.disabled = false
      }
    })

    // Load API keys
    window.loadApiKeys = async function() {
      if (!await waitForClerk()) {
        const apiKeysList = document.getElementById('apiKeysList')
        if (!apiKeysList) return
        apiKeysList.innerHTML = `
          <div style="text-align: center; padding: 20px; color: #ef4444;">
            <p>认证加载超时</p>
            <button onclick="loadApiKeys()" style="margin-top: 12px; padding: 8px 16px; background: #8b5cf6; color: #fff; border: none; border-radius: 6px; cursor: pointer;">重试</button>
          </div>
        `
        return
      }

      try {
        const apiKeysList = document.getElementById('apiKeysList')
        if (!apiKeysList) return
        const token = await Clerk.session.getToken()
        const response = await fetch('/api/api-keys', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const result = await response.json()

        if (result.success && result.data?.keys) {
          renderApiKeys(result.data.keys)
        } else {
          apiKeysList.innerHTML = `
            <div style="text-align: center; padding: 20px; color: var(--text-tertiary);">
              <p style="margin-bottom: 8px;">暂无 API Keys</p>
              <p style="font-size: 12px;">点击上方按钮创建第一个Key</p>
            </div>
          `
        }
      } catch (error) {
        console.error('Load keys error:', error)
        const apiKeysList = document.getElementById('apiKeysList')
        if (apiKeysList) {
          apiKeysList.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #ef4444;">
              <p>加载失败</p>
              <p style="font-size: 12px; margin-top: 8px;">${error.message}</p>
            </div>
          `
        }
      }
    }

    // Render API keys
    function renderApiKeys(keys) {
      if (!keys || keys.length === 0) {
        apiKeysList.innerHTML = `
          <div style="text-align: center; padding: 20px; color: var(--text-tertiary);">
            <p style="margin-bottom: 8px;">暂无 API Keys</p>
            <p style="font-size: 12px;">点击上方按钮创建第一个Key</p>
          </div>
        `
        return
      }

      apiKeysList.innerHTML = keys.map(key => `
        <div class="api-key-item ${key.status.revoked ? 'api-key-revoked' : ''}">
          <div class="api-key-info">
            <span class="api-key-name">${escapeHtml(key.name)}</span>
            <span class="api-key-prefix">${escapeHtml(key.prefix)}***</span>
            <span class="api-key-stats">
              使用 ${key.usage?.total || 0} 次 
              ${key.usage?.lastUsed ? '| 最后: ' + formatDate(key.usage.lastUsed) : ''}
            </span>
          </div>
          <div class="api-key-actions">
            ${!key.status.revoked ? `
              <button class="btn-copy-key" onclick="copyKeyToClipboard('${escapeHtml(key.prefix)}')">复制</button>
              <button class="btn-delete-key" onclick="showDeleteConfirm(${key.id}, '${escapeHtml(key.name)}')">删除</button>
            ` : '<span style="font-size: 12px; color: #ef4444;">已删除</span>'}
          </div>
        </div>
      `).join('')
    }

    // Make functions globally accessible
    window.copyKeyToClipboard = async function(prefix) {
      if (!await waitForClerk()) {
        alert('认证加载中，请稍后...')
        return
      }

      try {
        const token = await Clerk.session.getToken()
        const response = await fetch('/api/api-keys', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const result = await response.json()
        
        if (result.success && result.data?.keys) {
          const key = result.data.keys.find(k => k.prefix === prefix)
          if (key) {
            alert('API Key前缀: ' + key.prefix + '\n完整Key仅在创建时显示，请妥善保管！')
          }
        }
      } catch (error) {
        console.error('Copy error:', error)
      }
    }

    // 删除确认模态框相关
    let pendingDeleteKeyId = null
    let pendingDeleteKeyName = null
    const deleteConfirmModal = document.getElementById('delete-confirm-modal')
    const deleteKeyNameSpan = document.getElementById('delete-key-name')
    const btnDeleteConfirm = document.getElementById('btn-delete-confirm')
    const btnDeleteCancel = document.getElementById('btn-delete-cancel')

    // 显示删除确认
    window.showDeleteConfirm = function(keyId, keyName) {
      pendingDeleteKeyId = keyId
      pendingDeleteKeyName = keyName
      deleteKeyNameSpan.textContent = keyName
      deleteConfirmModal.classList.add('active')
    }

    // 隐藏删除确认
    function hideDeleteConfirm() {
      deleteConfirmModal.classList.remove('active')
      pendingDeleteKeyId = null
      pendingDeleteKeyName = null
    }

    // 点击取消
    btnDeleteCancel?.addEventListener('click', hideDeleteConfirm)

    // 点击模态框外部关闭
    deleteConfirmModal?.addEventListener('click', (e) => {
      if (e.target === deleteConfirmModal) {
        hideDeleteConfirm()
      }
    })

    // ESC关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && deleteConfirmModal.classList.contains('active')) {
        hideDeleteConfirm()
      }
    })

    // 确认删除
    btnDeleteConfirm?.addEventListener('click', async () => {
      if (!pendingDeleteKeyId) return

      if (!await waitForClerk()) {
        hideDeleteConfirm()
        alert('认证加载中，请稍后...')
        return
      }

      try {
        const token = await Clerk.session.getToken()
        const response = await fetch(`/api/api-keys-manage?id=${pendingDeleteKeyId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })

        const result = await response.json()

        if (result.success) {
          hideDeleteConfirm()
          loadApiKeys()
        } else {
          alert(result.error || '删除失败')
        }
      } catch (error) {
        console.error('Delete error:', error)
        alert('删除失败: ' + error.message)
      }
    })

    // 保留revokeKey作为别名
    window.revokeKey = window.showDeleteConfirm

    // Helper functions
    function escapeHtml(text) {
      const div = document.createElement('div')
      div.textContent = text
      return div.innerHTML
    }

    function formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleDateString('zh-CN', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Load keys when modal opens
    const originalClose = closeModal
    closeModal = function() {
      originalClose()
      closeCreateKeyModal()
      // 延迟加载确保模态框动画完成
      setTimeout(loadApiKeys, 100)
    }
  }

  // ─── OPEN CONSOLE MODAL ───
  function openConsoleModal() {
    const consoleModal = document.getElementById('console-modal')
    if (consoleModal) {
      consoleModal.style.display = 'block'
      document.body.style.overflow = 'hidden'
      // 打开时重新加载Keys（确保Clerk已加载）
      setTimeout(window.loadApiKeys, 100)
    }
  }

  // Make it globally accessible
  window.openConsoleModal = openConsoleModal

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
    initConsoleModal()
  })
})()

/**
 * SFX Manager - Gestion du feedback sonore UI
 */

const SFXManager = (() => {
    const clickSoundPath = './assets/sounds/cobblemongg_hover.ogg'
    const storageKey = 'cobblehub_sfx_enabled'
    let clickSound = null
    // In-memory fallback in case localStorage is unavailable under the
    // custom file:// protocol handler used by ejs-electron.
    let enabledMemory = true

    function init() {
        if (clickSound === null) {
            clickSound = new Audio(clickSoundPath)
            clickSound.preload = 'auto'
        }
        try {
            const stored = localStorage.getItem(storageKey)
            if (stored != null) {
                enabledMemory = stored !== 'false'
            }
        } catch (err) {
            console.debug('localStorage unavailable, using in-memory SFX toggle:', err)
        }
    }

    function isEnabled() {
        return enabledMemory
    }

    function setEnabled(val) {
        enabledMemory = val
        try {
            localStorage.setItem(storageKey, val ? 'true' : 'false')
        } catch (err) {
            console.debug('localStorage unavailable, SFX toggle kept in-memory only:', err)
        }
        updateToggleButton()
    }

    function playClickSound() {
        if (clickSound && isEnabled()) {
            clickSound.currentTime = 0
            clickSound.play().catch(err => {
                console.debug('Click sound playback prevented:', err)
            })
        }
    }

    function bindClickSounds() {
        document.addEventListener('click', (event) => {
            const target = event.target
            if (target.closest('#frameBar') != null) {
                return
            }
            if (target.closest('button') != null || target.classList.contains('sfx-click')) {
                playClickSound()
            }
        }, true)
    }

    function updateToggleButton() {
        const btn = document.getElementById('sfxToggleButton')
        if (btn == null) {
            return
        }
        const enabled = isEnabled()
        btn.classList.toggle('sfx-muted', !enabled)
        const waves = document.getElementById('sfxWaves')
        const muteLines = document.getElementById('sfxMuteLines')
        if (waves != null) waves.style.display = enabled ? '' : 'none'
        if (muteLines != null) muteLines.style.display = enabled ? 'none' : ''
    }

    function bindToggleButton() {
        const btn = document.getElementById('sfxToggleButton')
        if (btn == null) {
            return
        }
        btn.addEventListener('click', (event) => {
            event.stopPropagation()
            setEnabled(!isEnabled())
        })
        updateToggleButton()
    }

    return {
        init: init,
        bindClickSounds: bindClickSounds,
        bindToggleButton: bindToggleButton
    }
})()

SFXManager.init()
document.addEventListener('DOMContentLoaded', () => {
    SFXManager.bindClickSounds()
    SFXManager.bindToggleButton()
})

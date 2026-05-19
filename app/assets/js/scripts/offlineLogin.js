/**
 * Script for offlineLogin.ejs
 */
const validUsernameOffline = /^[a-zA-Z0-9_]{1,16}$/

const offlineLoginCancelContainer = document.getElementById('offlineLoginCancelContainer')
const offlineLoginCancelButton = document.getElementById('offlineLoginCancelButton')
const offlineLoginUsernameError = document.getElementById('offlineLoginUsernameError')
const offlineLoginUsername = document.getElementById('offlineLoginUsername')
const offlineLoginButton = document.getElementById('offlineLoginButton')
const offlineLoginForm = document.getElementById('offlineLoginForm')

let lou = false

function showOfflineError(element, value){
    element.innerHTML = value
    element.style.opacity = 1
}

function shakeOfflineError(element){
    if(element.style.opacity == 1){
        element.classList.remove('shake')
        void element.offsetWidth
        element.classList.add('shake')
    }
}

function validateOfflineUsername(value){
    if(value){
        if(!validUsernameOffline.test(value)){
            showOfflineError(offlineLoginUsernameError, Lang.queryJS('login.error.invalidValue'))
            offlineLoginDisabled(true)
            lou = false
        } else {
            offlineLoginUsernameError.style.opacity = 0
            lou = true
            offlineLoginDisabled(false)
        }
    } else {
        lou = false
        showOfflineError(offlineLoginUsernameError, Lang.queryJS('login.error.requiredValue'))
        offlineLoginDisabled(true)
    }
}

offlineLoginUsername.addEventListener('focusout', (e) => {
    validateOfflineUsername(e.target.value)
    shakeOfflineError(offlineLoginUsernameError)
})

offlineLoginUsername.addEventListener('input', (e) => {
    validateOfflineUsername(e.target.value)
})

function offlineLoginDisabled(v){
    if(offlineLoginButton.disabled !== v){
        offlineLoginButton.disabled = v
    }
}

function offlineLoginLoading(v){
    if(v){
        offlineLoginButton.setAttribute('loading', v)
        offlineLoginButton.innerHTML = offlineLoginButton.innerHTML.replace(Lang.queryJS('login.login'), Lang.queryJS('login.loggingIn'))
    } else {
        offlineLoginButton.removeAttribute('loading')
        offlineLoginButton.innerHTML = offlineLoginButton.innerHTML.replace(Lang.queryJS('login.loggingIn'), Lang.queryJS('login.login'))
    }
}

function offlineFormDisabled(v){
    offlineLoginDisabled(v)
    offlineLoginCancelButton.disabled = v
    offlineLoginUsername.disabled = v
}

let offlineLoginViewOnSuccess = VIEWS.landing
let offlineLoginViewOnCancel = VIEWS.loginOptions
let offlineLoginViewCancelHandler

function offlineLoginCancelEnabled(val){
    if(val){
        $(offlineLoginCancelContainer).show()
    } else {
        $(offlineLoginCancelContainer).hide()
    }
}

offlineLoginCancelButton.onclick = (e) => {
    switchView(getCurrentView(), offlineLoginViewOnCancel, 500, 500, () => {
        offlineLoginUsername.value = ''
        offlineLoginCancelEnabled(false)
        if(offlineLoginViewCancelHandler != null){
            offlineLoginViewCancelHandler()
            offlineLoginViewCancelHandler = null
        }
    })
}

offlineLoginForm.onsubmit = () => { return false }

offlineLoginButton.addEventListener('click', () => {
    offlineFormDisabled(true)
    offlineLoginLoading(true)

    AuthManager.addOfflineAccount(offlineLoginUsername.value).then((value) => {
        updateSelectedAccount(value)
        offlineLoginButton.innerHTML = offlineLoginButton.innerHTML.replace(Lang.queryJS('login.loggingIn'), Lang.queryJS('login.success'))
        $('.circle-loader').toggleClass('load-complete')
        $('.checkmark').toggle()
        setTimeout(() => {
            switchView(VIEWS.offlineLogin, offlineLoginViewOnSuccess, 500, 500, async () => {
                if(offlineLoginViewOnSuccess === VIEWS.settings){
                    await prepareSettings()
                }
                offlineLoginViewOnSuccess = VIEWS.landing
                offlineLoginCancelEnabled(false)
                offlineLoginViewCancelHandler = null
                offlineLoginUsername.value = ''
                $('.circle-loader').toggleClass('load-complete')
                $('.checkmark').toggle()
                offlineLoginLoading(false)
                offlineLoginButton.innerHTML = offlineLoginButton.innerHTML.replace(Lang.queryJS('login.success'), Lang.queryJS('login.login'))
                offlineFormDisabled(false)
            })
        }, 1000)
    }).catch((displayableError) => {
        offlineLoginLoading(false)
        let actualDisplayableError = displayableError || Lang.queryJS('login.error.unknown')

        setOverlayContent(actualDisplayableError.title, actualDisplayableError.desc, Lang.queryJS('login.tryAgain'))
        setOverlayHandler(() => {
            offlineFormDisabled(false)
            toggleOverlay(false)
        })
        toggleOverlay(true)
    })
})
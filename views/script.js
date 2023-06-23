console.log("jss");
window.addEventListener('load', function () {
    var divs = document.getElementsByClassName('animation');
    for (var i = 0; i < divs.length; i++) {
        divs[i].style.animationDelay = i * 0.1 + 's';
    }
});
const menu = document.querySelector('.menu-bar');
        const menuList = document.querySelector('.menu-list');

const button = () => {
    const displayValue = window.getComputedStyle(menuList).getPropertyValue('display');
    console.log(displayValue);
    menu.classList.toggle('toggle');
    
    if (displayValue === 'none') {
        menuList.style.display ='flex'
        menuList.style.justifyContent = 'flex-end';
        menuList.style.textAlign = 'center';
        menuList.style.border = 'none';
        menuList.style.float = 'right';
    }
    else {
        menuList.style.display ='none';
    }
}


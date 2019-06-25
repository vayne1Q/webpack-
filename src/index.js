// import './style.css';
console.log('hello world');


if('serviceWorker' in navigator){
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker')
        .then(registration => {
            console.log('service-worker registed');
        }).catch(error => {
            console.log('service-worker register error')
        })
    })
}
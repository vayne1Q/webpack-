document.addEventListener('click', () => {
    import(/* webpackPreload: true */'./click.js').then(({default : func}) => {
        func();
    })
});


// function getComponent() {
//     return import(/* webpackChunkName:"lodash" */'lodash').then(({default: _}) => {
//         var element = document.createElement('div');
//         element.innerHTML = _.join(['Del', 'Lee'], '-');
//         return element;
//     })
// }

// getComponent().then(element => {
//     document.body.appendChild(element);
// })
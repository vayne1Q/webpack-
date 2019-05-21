import '@babel/polyfill';
let arr = [
    new Promise(()=>{}),
    new Promise(()=>{}),
];
arr.map(item=>console.log(item));
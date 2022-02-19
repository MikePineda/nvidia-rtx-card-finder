const axios = require('axios');
const cheerio = require('cheerio');
const opn = require('opn');
const puppeteer = require('puppeteer');

//ddTech
const ddtecNvidia3070Url = "https://ddtech.mx/buscar/tarjeta+de+video+nvidia+geforce+rtx+3070";
const ddtecNvidia3080Url = "https://ddtech.mx/buscar/tarjeta+de+video+nvidia+geforce+rtx+3080";
const ddtechRadeonUrl = "https://ddtech.mx/buscar/radeon+rx+6800";

//Dimercom
const dimercomNvidia3070Url = "https://www.dimercom.mx/index.php?route=product/search&search=rtx%203070&filter_instock=true";
const dimercomNvidia3080Url = "https://www.dimercom.mx/index.php?route=product/search&search=rtx%203080&filter_instock=true";
//digital life
const digitalLifeNvidia3070Url = "https://www.digitalife.com.mx/buscar/t_rtx-3070";


//consts
const priceFor3080 = 15000;

async function findRTX3070InDdTech() {
    console.log("Buscando RTX 3070 en ddtech...");
    const pageContent = await axios.get(ddtecNvidia3070Url);
    const products = getProductsFromDdtechHtml(pageContent);


    //console.log(products);
    var tarjetaEncontrada = false;
    products.forEach(tarjeta => {
        if(tarjeta.enExistencia){
            console.log(`Encontrada! Precio: ${tarjeta.price}. Nombre: ${tarjeta.title}`);
            console.log(tarjeta.link);
            opn(tarjeta.link, {app: 'chrome'});
            tarjetaEncontrada = true;
        }
    });
    if(!tarjetaEncontrada) setTimeout(findRTX3070InDdTech, 5000);
}

async function findRTX3080InDdTech() {
    console.log("Buscando RTX 3080...");
    const pageContent = await axios.get(ddtecNvidia3080Url);
    const products = getProductsFromDdtechHtml(pageContent);

    var tarjetaEncontrada = false;
    products.forEach(tarjeta => {
        //solo tarjetas baratonas
        if(tarjeta.enExistencia && tarjeta.price <= priceFor3080){
            console.log(`Encontrada! Precio: ${tarjeta.price}. Nombre: ${tarjeta.title}`);
            console.log(tarjeta.link);
            opn(tarjeta.link, {app: 'chrome'});
            tarjetaEncontrada = true;
        }
    });
    if(!tarjetaEncontrada) setTimeout(findRTX3080InDdTech, 5000);
}



async function findRadeon6800InDdTech(){
    console.log("Buscando Radeon 6800 o 6800XT...");
    const pageContent = await axios.get(ddtechRadeonUrl);
    const products = getProductsFromDdtechHtml(pageContent);


    var tarjetaEncontrada = false;
    products.forEach(tarjeta => {
        if(tarjeta.enExistencia){
            console.log(`Encontrada! Precio: ${tarjeta.price}. Nombre: ${tarjeta.title}`);
            console.log(tarjeta.link);
            opn(tarjeta.link, {app: 'chrome'});
        }
    });
    // buscando cada 30 min pues ni se que pedo
    if(!tarjetaEncontrada) setTimeout(findRadeon6800InDdTech, 30 * 60000);
}

async function findRTX3070InDimercom() {
    console.log("Buscando RTX 3070 en dimercom...");
    const pageContent = await axios.get(dimercomNvidia3070Url);
    const products = getProductsFromDimercomHtml(pageContent);


    //console.log(products);
    var tarjetaEncontrada = false;
    products.forEach(tarjeta => {

        if(tarjeta.enExistencia && tarjeta.price <= 17000){
            console.log(`Encontrada! Precio: ${tarjeta.price}. Nombre: ${tarjeta.title}`);
            console.log(tarjeta.link);
            opn(tarjeta.link, {app: 'chrome'});
            tarjetaEncontrada = true;
        }
    });
    if(!tarjetaEncontrada) setTimeout(findRTX3070InDimercom, 5000);
}


async function findRTX3080InDimercom() {
    console.log("Buscando RTX 3080 en dimercom...");
    const pageContent = await axios.get(dimercomNvidia3080Url);
    const products = getProductsFromDimercomHtml(pageContent);


    //console.log(products);
    var tarjetaEncontrada = false;
    products.forEach(tarjeta => {

        if(tarjeta.enExistencia && tarjeta.price <= 21000){
            console.log(`Encontrada! Precio: ${tarjeta.price}. Nombre: ${tarjeta.title}`);
            console.log(tarjeta.link);
            opn(tarjeta.link, {app: 'chrome'});
            tarjetaEncontrada = true;
        }
    });
    if(!tarjetaEncontrada) setTimeout(findRTX3080InDimercom, 5000);
}


async function findRTX3070InDigitalLife() {
    console.log("Buscando RTX 3070 en DigitalLife...");
    const chromeOptions = {
        headless:false,
        defaultViewport: null};
      (async function main() {
        const browser = await puppeteer.launch(chromeOptions);
        const page = await browser.newPage();
        await checkDigitalLifePage(page);
      })();
}

async function checkDigitalLifePage(page){
    await page.goto(digitalLifeNvidia3070Url);
    await page.waitForSelector('.product-item');
    const data = await page.evaluate(() => document.querySelector('#main-container').outerHTML);        
    var products = getProductsFromDigitalLifeHtml(data);
    var tarjetaEncontrada = false;
    products.forEach(tarjeta => {
        if(tarjeta.enExistencia && tarjeta.price <= 17000){
            console.log(`Encontrada! Precio: ${tarjeta.price}. Nombre: ${tarjeta.title}`);
            console.log(tarjeta.link);
            opn(tarjeta.link, {app: 'chrome'});
            tarjetaEncontrada = true;
        }
    });
    if(!tarjetaEncontrada){
        await page.evaluate(() => {
            location.reload(true)
        });
        checkDigitalLifePage(page);
        //setTimeout(checkDigitalLifePage(page), 5000);
    }
}


function getProductsFromDdtechHtml(pageContent){
    const $ = cheerio.load(pageContent.data);
    const products = $('div.product').map((_, el) => {
        el = $(el);
        const title = el.find('a').attr('title');
        const price = parseFloat(el.find('div.product-price').text().replace(/(\r\n|\n|\r)/gm, "").substring(1).replace(/,/g, ''));
        const link = el.find('a').attr('href');
        const enExistencia = (el.find('span.label-icon').text()).includes("SIN") ? false : true;
        return { title, price, link, enExistencia};
    }).get();

    return products;
}

function getProductsFromDimercomHtml(pageContent){
    const $ = cheerio.load(pageContent.data);
    const products = $('div.product-list div').map((_, el) => {
        el = $(el);
        const title = el.find('div.name a').text();
        const price = parseFloat(el.find('span.price-fixed').text().replace(/(\r\n|\n|\r)/gm, "").substring(1).replace(/,/g, ''));
        const link = el.find('div.name a').attr('href');
        //en dimercom si sale en la busqueda siempre tendra existencias
        const enExistencia = true;
        return { title, price, link, enExistencia};
    }).get();
    //me falto optimizar la busqueda pero vale v
    return products.filter(product => !isNaN(product.price) && product.title != '');
}

function getProductsFromDigitalLifeHtml(pageContent){
    const $ = cheerio.load(pageContent);
    const products = $('div.product-item').map((_, el) => {
        el = $(el);
        const title = el.find('div.product-title').text().replace(/(\r\n|\n|\r)/gm, "");
        var priceString = el.find('h5.font-weight-normal').text().replace(/(\r\n|\n|\r)/gm, "").substring(1).replace(/,/g, '');
        const price = parseFloat(priceString.substring(0, priceString.length - 2));
        const link = el.find('a').attr('href');
        //en dimercom si sale en la busqueda siempre tendra existencias
        const enExistencia = (el.find('div.text-danger').text() === '') ? true : false;
        return { title, price, link, enExistencia};
    }).get();
    //TODO: optimize search xd
    return products;
}


findRTX3070InDimercom();
findRTX3080InDimercom();
findRTX3070InDdTech();
findRTX3080InDdTech();
findRadeon6800InDdTech();
findRTX3070InDigitalLife();







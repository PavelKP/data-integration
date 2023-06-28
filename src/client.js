import fetch from 'node-fetch'

/*
-> data enrichment - data processing
	Вызываем несколько апишек, чтобы обогатить данные 

	1. We read data form DB
	2. Go to secon API to get more detailed information
	3. We submit data to other API
*/

const myDB = async () => Array.from({
	length: 1000
}, (v, index) => `${index}-laptop`)

const PRODUCTS_API = 'http:localhost:3001/products'
const CART_API = 'http:localhost:4001/cart'

// При таком подходе, что будет если какой-то запрос из 1000 упадет
// Мы не получаем никакого фидбека от апи
// Нам придется повторить все тоже самое еще раз

/*
async function processDBData() {
	const products = await myDB()
	const responses = []
	for (const product of products) {
		const productInfo = await (await fetch(`${PRODUCTS_API}?name=${product}`)).text()
		const cartApiInfo = await (await fetch(`${CART_API}`, {
			method: 'POST',
			body: productInfo
		})).text()

		responses.push(productInfo)
	}

	return responses
}

console.table(await processDBData())
*/


// Используем генераторы
// Это не просто функция генератор, это асинхронная функция генератор

async function* processDBData() {
	const products = await myDB()

	for (const product of products) {
		const productInfo = await (await fetch(`${PRODUCTS_API}?name=${product}`)).text()
		const cartApiInfo = await (await fetch(`${CART_API}`, {
			method: 'POST',
			body: productInfo
		})).text()

		// как только вызовется yeild
		// мы получим обогощенные данные в таблицу - по 1 продукту
		yield cartApiInfo
	}
}

// Нам не нужно выводить консолидированную таблицу сразу
// Будем выводить по одному элементу. Не забываем await for
// Мы получим моментальный фидбек, а не целый массив, где что-то могло упасть
// Если обнаружим ошибку, мы можем сохранить этот id и сделать на него запрос еще раз
for await (const data of processDBData()) {
	console.table(data)
}

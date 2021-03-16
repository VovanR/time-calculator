const inputElement = document.querySelector('#time-calculator-input');
const outputElement = document.querySelector('#time-calculator-output');

class Converter {
	constructor() {
		this._aliasRegister = new Map();
		this._luxonRegister = new Map();
	}

	/**
	 * @param {Object[]} types
	 * @param {string} types[].alias
	 * @param {string} types[].luxon
	 * @param {number} types[].factor
	 */
	registerTypes(types) {
		for (const {alias, luxon} of types) {
			this.registerType({alias, luxon});
		}
	}

	/**
	 * @param {alias} string
	 * @param {luxon} string
	 */
	registerType({alias, luxon}) {
		this._aliasRegister.set(alias, luxon);
		this._luxonRegister.set(luxon, alias);
	}

	/**
	 * @param {string} luxonType
	 * @return {string}
	 */
	getAliasByLuxonType(luxonType) {
		return this._luxonRegister.get(luxonType);
	}

	/**
	 * @param {string} alias
	 * @return {string}
	 */
	getLuxonTypeByAlias(alias) {
		return this._aliasRegister.get(alias);
	}

	/**
	 * @return {luxon.Duration}
	 */
	createEmptyLuxonDuration() {
		const emptyObject = {};
		for (const key of this._luxonRegister.keys()) {
			emptyObject[key] = 0;
		}

		return luxon.Duration.fromObject(emptyObject);
	}
}

const converter = new Converter();

/**
 * @param {string} value
 * @return {string}
 */
function getTypeByAlias(value) {
	return converter.getLuxonTypeByAlias(value);
}

/**
 * @param {string} value
 * @return {string}
 */
function getAliasByType(value) {
	return converter.getAliasByLuxonType(value);
}

// TODO: `factor` is not uset now
converter.registerTypes([
	{
		alias: 'y',
		luxon: 'years',
		factor: 365 * 24 * 60 * 60 * 1000
	},
	{
		alias: 'M',
		luxon: 'months',
		factor: 30 * 24 * 60 * 60 * 1000
	},
	{
		alias: 'w',
		luxon: 'weeks',
		factor: 7 * 24 * 60 * 60 * 1000
	},
	{
		alias: 'd',
		luxon: 'days',
		factor: 24 * 60 * 60 * 1000
	},
	{
		alias: 'h',
		luxon: 'hours',
		factor: 60 * 60 * 1000
	},
	{
		alias: 'm',
		luxon: 'minutes',
		factor: 60 * 1000
	},
	{
		alias: 's',
		luxon: 'seconds',
		factor: 1000
	},
	{
		alias: 'ms',
		luxon: 'milliseconds',
		factor: 1
	}
]);

/**
 * @const {RegExp}
 */
const VALUE_REGEX = /(-?\d+)(\w+)/;

function update() {
	outputElement.value = parseInputValue(inputElement.value);
}

/**
 * @param {string} value
 * @return {string}
 */
function parseInputValue(value) {
	value = value.trim();

	if (value === '') {
		return '';
	}

	const valueRowsArray = value.split('\n');

	const valueObjectArray = [];
	for (let valueRow of valueRowsArray) {
		valueRow = valueRow.trim();

		if (valueRow === '') {
			continue;
		}

		const valueRowObject = valueRowToObject(valueRow);

		if (valueRowObject) {
			valueObjectArray.push(valueRowObject);
		}
	}

	const valueLuxonArray = valueObjectArray.map(valueObject => valueObjectToLuxon(valueObject));

	let resultLuxon = converter.createEmptyLuxonDuration();
	for (const i of valueLuxonArray) {
		resultLuxon = resultLuxon.plus(i);
	}

	// Double normalize to fix extra negate minutes
	const normalizedObject = resultLuxon.normalize().normalize().toObject();

	const resultArray = [];
	for (const [key, value] of Object.entries(normalizedObject)) {
		if (value === 0) {
			continue;
		}

		resultArray.push(`${value}${getAliasByType(key)}`);
	}

	const resultString = resultArray.join(' ');

	if (resultString !== '') {
		return resultString;
	}

	return '0';
}

/**
 * @param {string} valueRow
 * @return {Object.<string, number>}
 */
function valueRowToObject(valueRow) {
	const isNegative = valueRow.startsWith('-');
	if (isNegative) {
		valueRow = valueRow.slice(1);
	}

	const valueRowPartsArray = valueRow.split(' ');

	const result = {};
	for (const value of valueRowPartsArray) {
		const valuePartsMatching = value.match(VALUE_REGEX);

		if (valuePartsMatching === null) {
			continue;
		}

		const [, number, typeAlias] = valuePartsMatching;

		const type = getTypeByAlias(typeAlias);
		if (!type) {
			continue;
		}

		let n = Number(number);
		if (isNegative) {
			n = -n;
		}

		result[type] = n;
	}

	return result;
}

/**
 * @param {Object} valueObject
 * @return {luxon.Duration}
 */
function valueObjectToLuxon(valueObject) {
	return luxon.Duration.fromObject(valueObject);
}

update();

inputElement.addEventListener('input', update);
inputElement.addEventListener('change', update);

inputElement.addEventListener('keydown', autosize);

function autosize() {
	setTimeout(() => {
		this.style.cssText = 'height: auto;';
		this.style.cssText = `height: ${this.scrollHeight}px`;
	}, 0);
}

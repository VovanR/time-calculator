const inputElement = document.querySelector('#time-calculator-input');
const outputElement = document.querySelector('#time-calculator-output');

class Converter {
	constructor() {
		this._aliasRegister = new Map();
		this._luxonRegister = new Map();
	}

	registerTypes(types) {
		types.forEach(this.registerType.bind(this));
	}

	registerType({alias, luxon}) {
		this._aliasRegister.set(alias, luxon);
		this._luxonRegister.set(luxon, alias);
	}

	getAliasByLuxonType(luxonType) {
		return this._luxonRegister.get(luxonType);
	}

	getLuxonTypeByAlias(alias) {
		return this._aliasRegister.get(alias);
	}
}

const converter = new Converter();

const getTypeByAlias = v => converter.getLuxonTypeByAlias(v);
const getAliasByType = v => converter.getAliasByLuxonType(v);

converter.registerTypes([
	{
		alias: 'y',
		luxon: 'years',
		factor: 365 * 24 * 60 * 60 * 1000
	},
	{
		alias: 'm',
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

const VALUE_REGEX = /(-?\d+)(\w+)/;

const update = () => {
	outputElement.value = parseInputValue(inputElement.value);
};

const parseInputValue = value => {
	if (value === '') {
		return '';
	}

	const valueRowsArray = value.split('\n');

	const valueObjectArray = [];
	valueRowsArray.forEach(valueRow => {
		valueRow = valueRow.trim();

		if (valueRow === '') {
			return;
		}

		const valueRowObject = valueRowToObject(valueRow);

		if (valueRowObject) {
			valueObjectArray.push(valueRowObject);
		}
	});

	const valueLuxonArray = valueObjectArray.map(valueObject => valueObjectToLuxon(valueObject));

	let resultLuxon = luxon.Duration.fromObject({});
	valueLuxonArray.forEach(i => {
		resultLuxon = resultLuxon.plus(i);
	});

	const normalizedObject = resultLuxon.normalize().toObject();

	const resultArray = [];
	Object.entries(normalizedObject).forEach(([key, value]) => {
		if (value === 0) {
			return;
		}

		resultArray.push(`${value}${getAliasByType(key)}`);
	});

	const resultString = resultArray.join(' ');

	if (resultString !== '') {
		return resultString;
	}

	return '0';
};

const valueRowToObject = valueRow => {
	const isNegative = valueRow.startsWith('-');
	if (isNegative) {
		valueRow = valueRow.slice(1);
	}

	const valueRowPartsArray = valueRow.split(' ');

	const result = {};
	valueRowPartsArray.forEach(value => {
		const valuePartsMatching = value.match(VALUE_REGEX);

		if (valuePartsMatching === null) {
			return;
		}

		const [, number, typeAlias] = valuePartsMatching;

		const type = getTypeByAlias(typeAlias);
		if (!type) {
			return;
		}

		let n = Number(number);
		if (isNegative) {
			n = -n;
		}

		result[type] = n;
	});

	return result;
};

const valueObjectToLuxon = valueObject => luxon.Duration.fromObject(valueObject);

update(inputElement.value);

inputElement.addEventListener('input', update);
inputElement.addEventListener('change', update);

inputElement.addEventListener('keydown', autosize);

function autosize() {
	const element = this;

	setTimeout(() => {
		element.style.cssText = 'height: auto;';
		element.style.cssText = 'height: ' + element.scrollHeight + 'px';
	}, 0);
}

/* global luxon */

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
	const valueRowsArray = value.split('\n');

	const valueObjectArray = valueRowsArray.reduce((acc, valueRow) => {
		valueRow = valueRow.trim();

		if (valueRow === '') {
			return acc;
		}

		const valueRowObject = valueRowToObject(valueRow);

		if (valueRowObject) {
			acc.push(valueRowObject);
		}

		return acc;
	}, []);

	const valueLuxonArray = valueObjectArray.map(valueObjectToLuxon);

	const resultLuxon = valueLuxonArray.reduce((acc, i) => {
		return acc.plus(i);
	}, luxon.Duration.fromObject({}));

	const normalizedObject = resultLuxon.normalize().toObject();

	const resultArray = Object.entries(normalizedObject).reduce((acc, [key, value]) => {
		if (value === 0) {
			return acc;
		}

		return acc.concat(`${value}${getAliasByType(key)}`);
	}, []);

	return resultArray.join(' ');
};

const valueRowToObject = valueRow => {
	const isNegative = valueRow.startsWith('-');
	if (isNegative) {
		valueRow = valueRow.substr(1);
	}

	const valueRowPartsArray = valueRow.split(' ');

	return valueRowPartsArray.reduce((acc, value) => {
		const valuePartsMatching = value.match(VALUE_REGEX);

		if (valuePartsMatching === null) {
			return acc;
		}

		const [, number, type] = valuePartsMatching;
		let n = Number(number);
		if (isNegative) {
			n = -n;
		}

		return {
			...acc,
			[getTypeByAlias(type)]: n
		};
	}, {});
};

const valueObjectToLuxon = valueObject => luxon.Duration.fromObject(valueObject);

update(inputElement.value);

inputElement.addEventListener('input', update);
inputElement.addEventListener('change', update);

inputElement.addEventListener('keydown', autosize);

function autosize() {
	const el = this;

	setTimeout(() => {
		el.style.cssText = 'height: auto;';
		el.style.cssText = 'height: ' + el.scrollHeight + 'px';
	}, 0);
}

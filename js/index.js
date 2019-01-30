/* global luxon */

const inputElement = document.querySelector('#time-calculator-input');
const outputElement = document.querySelector('#time-calculator-output');

class Converter {
	constructor() {
		this._aliasRegister = new Map();
		this._luxonRegister = new Map();
	}

	toAliasString() {

	}

	toLuxonObject() {

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

converter.registerTypes([
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

const VALUE_REGEX = /(?<number>-?\d+)(?<type>\w+)/;

inputElement.addEventListener('input', update);
inputElement.addEventListener('change', update);

const update = () => {
	outputElement.value = parseInputValue(inputElement.value);
};

const parseInputValue = value => {
	const valueArray = inputValueToRowsArray(value);

	const valueObjArray = valueArray.reduce((acc, i) => {
		if (i.trim() === '') {
			return acc;
		}

		const a = valueItemToObj(i);

		if (a) {
			acc.push(a);
		}

		return acc;
	}, []);

	const valueLuxonArray = valueObjArray.map(valueObjToLuxon);

	const resultLuxon = valueLuxonArray.reduce((acc, i) => {
		return acc.plus(i);
	}, luxon.Duration.fromObject({}));

	const o = resultLuxon.normalize().toObject();

	const s = Object.entries(o).reduce((acc, [key, value]) => {
		return acc.concat(`${value}${getAliasByType(key)}`);
	}, []);

	return s.join(' ');
};

const inputValueToRowsArray = value => value.split('\n');
const valueRowStringToPartsArray = value => value.split(' ');
const getTypeByAlias = v => converter.getLuxonTypeByAlias(v);
const getAliasByType = v => converter.getAliasByLuxonType(v);
const valueItemToObj = value => {
	const isNegative = value.startsWith('-');
	if (isNegative) {
		value = value.substr(1);
	}

	return valueRowStringToPartsArray(value).reduce((acc, i) => {
		if (i.trim() === '') {
			return acc;
		}

		const p = i.match(VALUE_REGEX);

		if (!p) {
			return acc;
		}

		const {number, type} = p.groups;
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

const valueObjToLuxon = value => luxon.Duration.fromObject(value);

update(inputElement.value);

inputElement.addEventListener('keydown', autosize);

function autosize() {
	const el = this;
	setTimeout(() => {
		el.style.cssText = 'height:auto;';
		el.style.cssText = 'height:' + el.scrollHeight + 'px';
	}, 0);
}

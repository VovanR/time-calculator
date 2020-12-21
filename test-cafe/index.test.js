import {Selector} from 'testcafe';

/* eslint-disable new-cap */
const inputElement = Selector('#time-calculator-input');
const outputElement = Selector('#time-calculator-output');
/* eslint-enable new-cap */

// eslint-disable-next-line no-unused-expressions
fixture`Getting Started`
	.page`http://localhost:8080`;

const INPUT_PLACEHOLDER = `1h 30m
-45m
2h
1h`;
const OUTPUT_PLACEHOLDER = '3h 45m';

test('should loaded input focused', async t => {
	await t
		.expect(inputElement.focused).eql(true);
});

test('should loaded with placeholder demo', async t => {
	await t
		.expect(inputElement.getAttribute('placeholder')).eql(INPUT_PLACEHOLDER)
		.expect(outputElement.getAttribute('placeholder')).eql(OUTPUT_PLACEHOLDER);
});

test('should calculate input time', async t => {
	const inputText = `1h 30m
30m
-5m
-1h 5m`;

	await t
		.typeText(inputElement, inputText)
		.expect(outputElement.value).eql('50m');
});

test('should minutes to hours', async t => {
	const inputText = `20m
25m
30m`;

	await t
		.typeText(inputElement, inputText)
		.expect(outputElement.value).eql('1h 15m');
});

test('should calculate extra minutes', async t => {
	const inputText = `40h
40h
24h

-37h 20m
-38h 25m
-24h 30m`;

	await t
		.typeText(inputElement, inputText)
		.expect(outputElement.value).eql('3h 45m');
});

test('should respect time labels', async t => {
	const inputText = `shower 20m
dress 10m
walk bus station 10m
sleep 35m
walk to work 10m
make coffee 10m`;

	await t
		.typeText(inputElement, inputText)
		.expect(outputElement.value).eql('1h 35m');
});

test('should show zero result', async t => {
	const inputText = `15h 50m
-9h 30m
-5h 10m
-1h
-10m`;

	await t
		.typeText(inputElement, inputText)
		.expect(outputElement.value).eql('0');
});

test('should have output input read only', async t => {
	await t
		.typeText(outputElement, '5h')
		.expect(outputElement.value).eql('');
});

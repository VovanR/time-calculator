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

test('should loaded with input placeholder demo', async t => {
	await t
		.expect(inputElement.getAttribute('placeholder')).eql(INPUT_PLACEHOLDER);
});

test('should loaded with output placeholder demo', async t => {
	await t
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

test('should respect time labels', async t => {
	const inputText = `shower 20m
dress 10m
walk bus station 10m
sleep 35m
walk to work 10m
make coffee 10m`;

	await t
		.typeText(inputElement, inputText)
		.expect(outputElement.value).eql('95m');
});

test('should have output input read only', async t => {
	await t
		.typeText(outputElement, '5h')
		.expect(outputElement.value).eql('');
});

import {Selector} from 'testcafe';

/* eslint-disable new-cap */
const copyrightElement = Selector('.copyright');
/* eslint-enable new-cap */

// eslint-disable-next-line no-unused-expressions
fixture`Getting Started`
	.page`http://localhost:8080`;

test('should have copyright block with project source URL', async t => {
	await t
		.expect(copyrightElement.getAttribute('href')).eql('https://github.com/vovanr/time-calculator');
});

test('should have copyright block opens new tab URL', async t => {
	await t
		.expect(copyrightElement.getAttribute('target')).eql('_blank');
});

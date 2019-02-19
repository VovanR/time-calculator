/* global describe beforeEach cy it */

// https://example.cypress.io/

const INPUT_PLACEHOLDER = `1h 30m
-45m
2h
1h`;
const OUTPUT_PLACEHOLDER = '3h 45m';

describe('time-calculator', () => {
	beforeEach(() => {
		cy.visit('index.html');
	});

	it('should loaded input focused', () => {
		cy.focused().should('have.attr', 'id', 'time-calculator-input');
	});

	it('should loaded with placeholder demo', () => {
		cy.get('#time-calculator-input').should('have.attr', 'placeholder', INPUT_PLACEHOLDER);
		cy.get('#time-calculator-output').should('have.attr', 'placeholder', OUTPUT_PLACEHOLDER);
	});

	it('should calculate input time', () => {
		cy.get('#time-calculator-input')
			.type('1h 30m')
			.type('\n')
			.type('30m')
			.type('\n')
			.type('-5m')
			.type('\n')
			.type('-1h 5m');
		cy.get('#time-calculator-output').should('have.value', '50m');
	});

	it('should respect time labels', () => {
		cy.get('#time-calculator-input')
			.type(`shower 20m
dress 10m
walk bus station 10m
sleep 35m
walk to work 10m
make coffee 10m`);
		cy.get('#time-calculator-output').should('have.value', '95m');
	});

	it('should have output input read only', () => {
		// TODO: Waiting for https://github.com/cypress-io/cypress/issues/1246
		// cy.get('#time-calculator-output')
		// 	.type('5h')
		// 	.should('have.value', '');
		cy.get('#time-calculator-output')
			.should('have.attr', 'readonly', 'readonly');
	});

	it('should have copyright block with project source URL', () => {
		cy.get('.copyright').should('have.attr', 'href', 'https://github.com/vovanr/time-calculator');
	});

	it('should have copyright block opens new tab URL', () => {
		cy.get('.copyright').should('have.attr', 'target', '_blank');
	});
});

describe(__filename, () => {
  Cypress.env('chainId', '1');
  Cypress.env('preset', 'main');
  Cypress.env('walletAddress', '0xc3Cf311e04c1f8C74eCF6a795Ae760dc6312F345');
  Cypress.env('accountId', '651583203448');

  beforeEach(() => {
    cy.task('startAnvil', {
      chainId: Cypress.env('chainId'),
      forkUrl:
        Cypress.env('RPC_MAINNET') ?? `https://mainnet.infura.io/v3/${Cypress.env('INFURA_KEY')}`,
      block: '22079028',
    }).then(() => cy.log('Anvil started'));
    cy.pythBypass();

    cy.on('window:before:load', (win) => {
      win.localStorage.setItem('MAGIC_WALLET', Cypress.env('walletAddress'));
      win.localStorage.setItem(
        'DEFAULT_NETWORK',
        `${Cypress.env('chainId')}-${Cypress.env('preset')}`
      );
    });
  });
  afterEach(() => cy.task('stopAnvil').then(() => cy.log('Anvil stopped')));

  it(__filename, () => {
    cy.setEthBalance({ balance: 100 });

    cy.visit('/?showAll=yes');

    cy.get('[data-cy="short wallet address"]').contains(
      `${Cypress.env('walletAddress').substring(0, 6)}...${Cypress.env('walletAddress').substring(
        Cypress.env('walletAddress').length - 4
      )}`
    );

    cy.contains('p', 'Welcome to your final burn.').should('exist');
  });
});

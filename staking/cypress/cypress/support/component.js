import { ChakraProvider } from '@chakra-ui/react';
import '@cypress/code-coverage/support';

import { theme } from '@_/theme';
import { mount } from '@cypress/react';
import { MemoryRouter } from 'react-router-dom';

function Container(props) {
  return (
    <ChakraProvider theme={theme}>
      <MemoryRouter>
        <div id="app" {...props} />
      </MemoryRouter>
    </ChakraProvider>
  );
}

Cypress.Commands.add('mount', (el) => mount(<Container>{el}</Container>));

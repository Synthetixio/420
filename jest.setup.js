/* eslint-disable react/display-name */
import { TextDecoder, TextEncoder } from 'node:util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// jest.mock('../assets/svg/app/loader.svg', () => () => null);

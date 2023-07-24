import * as path from 'node:path';
import * as fs from 'node:fs';

import { browser, $, expect } from '@wdio/globals';

import { waitForFileExists } from '../support/utils.js';

describe('Basic functionality', () => {
  it('should convert input and display in output area', async () => {
    await browser.url('/');

    const $input = await $('#input');
    const $output = await $('#output');

    await $input.click();
    // Ideally, this would be `browser.keys([Key.Ctrl, 'b'])`, but only some
    // browsers automatically map basic formatting commands to the keyboard.
    await browser.execute(() => {
      document.execCommand('bold', false, null);
    });
    await browser.keys('convert me');

    await expect($output).toHaveValue('**convert me**');
  });

  // TODO: test pasting

  it('shows placeholder-style instructions when input is empty', async () => {
    await browser.url('/');

    const $input = await $('#input-area');
    const $inputInstructions = await $input.$('.instructions');
    const $outputInstructions = await $('#output-area .instructions');

    // NOTE: `toHaveTextContaining()` does not seem to work right in Safari
    // when text is in the DOM but hidden (it should report false). Instead, we
    // directly test of whether the instructions elements are displayed.
    // Not as nice, but oh well.
    await expect($inputInstructions).toBeDisplayed();
    await expect($outputInstructions).toBeDisplayed();

    await $input.click();
    await browser.keys('convert me');

    await expect($inputInstructions).not.toBeDisplayed();
    await expect($outputInstructions).not.toBeDisplayed();
  });

  it('should download the markdown when the button is clicked', async () => {
    await browser.url('/');

    const $input = await $('#input');
    const $output = await $('#output');

    await $input.click();
    // Ideally, this would be `browser.keys([Key.Ctrl, 'b'])`, but only some
    // browsers automatically map basic formatting commands to the keyboard.
    await browser.execute(() => {
      document.execCommand('bold', false, null);
    });
    await browser.keys('convert me');

    const $download_button = await $('#download-button');
    await $download_button.click();

    const filePath = path.join(global.downloadDir, "Converted Text.md");
    await browser.call(function (){
      // call our custom function that checks for the file to exist
      return waitForFileExists(filePath, 60000)
    });

    const fileContents = fs.readFileSync(filePath, 'utf-8');
    await expect(fileContents).toBe('**convert me**\n')
  });
  // TODO: test copy button (requires serving over HTTPS in some browsers)
});

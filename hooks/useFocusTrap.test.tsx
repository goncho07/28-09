import { render } from '@testing-library/react';
import React, { useEffect } from 'react';
import { useFocusTrap } from './useFocusTrap';

const FocusTrapTestComponent = () => {
  const trapRef = useFocusTrap<HTMLDivElement>();

  return (
    <div ref={trapRef}>
      <button>Button 1</button>
      <button>Button 2</button>
    </div>
  );
};

test('useFocusTrap should focus the first focusable element on mount', () => {
  render(<FocusTrapTestComponent />);

  const button1 = document.querySelector('button');
  expect(button1).toHaveFocus();
});
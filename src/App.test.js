import { render, screen } from '@testing-library/react';
import App from './App';
import React from "react";
import { MemoryRouter } from "react-router-dom"; 

test('renders learn react link', () => {
  render(<App />);
  const sportifyElements = screen.getAllByText(/SPORT!FY/i);
  expect(sportifyElements[0]).toBeInTheDocument();
});

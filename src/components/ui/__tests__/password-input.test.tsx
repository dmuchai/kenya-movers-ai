import { render, screen, fireEvent } from '@testing-library/react';
import { PasswordInput } from '../password-input';

describe('PasswordInput', () => {
  it('renders password input with toggle button', () => {
    const mockToggle = jest.fn();
    render(
      <PasswordInput
        showPassword={false}
        onToggleVisibility={mockToggle}
        placeholder="Enter password"
      />
    );

    const input = screen.getByPlaceholderText('Enter password');
    const toggleButton = screen.getByRole('button');

    expect(input).toHaveAttribute('type', 'password');
    expect(toggleButton).toBeInTheDocument();
  });

  it('toggles password visibility when button is clicked', () => {
    const mockToggle = jest.fn();
    render(
      <PasswordInput
        showPassword={false}
        onToggleVisibility={mockToggle}
        placeholder="Enter password"
      />
    );

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('shows correct icon based on visibility state', () => {
    const mockToggle = jest.fn();
    const { rerender } = render(
      <PasswordInput
        showPassword={false}
        onToggleVisibility={mockToggle}
        placeholder="Enter password"
      />
    );

    // When password is hidden, should show Eye icon
    expect(screen.getByTestId('eye-icon')).toBeInTheDocument();

    // When password is shown, should show EyeOff icon
    rerender(
      <PasswordInput
        showPassword={true}
        onToggleVisibility={mockToggle}
        placeholder="Enter password"
      />
    );

    expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument();
  });
});
